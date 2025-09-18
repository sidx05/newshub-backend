import Parser from "rss-parser";
import axios from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto";
import { db } from '../../../src/lib/db';
import { logger } from "../utils/logger"; // make sure this exists

export interface ScrapedArticle {
  title: string;
  summary: string;
  content: string;
  images: {
    url: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
    source: "scraped" | "opengraph" | "ai_generated" | "api";
  }[];
  category: string;
  tags: string[];
  author: string;
  lang: string;
  sourceUrl: string;
  publishedAt: Date;
  hash: string;
  openGraph?: {
    image?: string;
    title?: string;
    description?: string;
  };
}

export class ScrapingService {
  private rssParser: Parser;

  constructor() {
    this.rssParser = new Parser();
  }

  async scrapeAllSources(): Promise<ScrapedArticle[]> {
    try {
      logger.info("🔹 Starting scraping for all sources");
      const sources = await db.source.findMany({ where: { active: true } });

      let allArticles: ScrapedArticle[] = [];

      for (const source of sources) {
        try {
          const articles = await this.scrapeSource(source);
          for (const scraped of articles) {
            await db.article.create({
              data: {
                title: scraped.title,
                summary: scraped.summary,
                content: scraped.content,
                url: scraped.sourceUrl,
                hash: scraped.hash,
                category: scraped.category,
                image: scraped.images?.[0]?.url ?? null,
                published: scraped.publishedAt,
              },
            });
          }

          allArticles = allArticles.concat(articles);

          await db.source.update({
            where: { id: source.id },
            data: { lastScraped: new Date() },
          });
        } catch (err: unknown) {
          logger.error(`❌ Error scraping source ${source.name}: ${(err as Error).message}`);
        }
      }

      logger.info(`✅ Scraping completed. Total articles: ${allArticles.length}`);
      return allArticles;
    } catch (err: unknown) {
      logger.error(`❌ scrapeAllSources error: ${(err as Error).message}`);
      return [];
    }
  }

  async scrapeSource(source: any): Promise<ScrapedArticle[]> {
    try {
      logger.info(`🔹 Scraping source: ${source.name}`);
      const articles: ScrapedArticle[] = [];

      // RSS scraping
      if (source.rssUrls && source.rssUrls.length > 0) {
        for (const rssUrl of source.rssUrls) {
          try {
            const feed = await this.rssParser.parseURL(rssUrl);
            for (const item of feed.items) {
              const scraped = await this.scrapeArticle(item, source);
              if (scraped) articles.push(scraped);
            }
          } catch (err: unknown) {
            logger.error(`❌ Error parsing RSS feed ${rssUrl}: ${(err as Error).message}`);
          }
        }
      }

      // API scraping (e.g., NewsAPI)
      if (source.type === "api" && source.apiUrl) {
        try {
          const resp = await axios.get(source.apiUrl, {
            params: { apiKey: process.env.NEWS_API_KEY },
          });

          logger.info(`DEBUG API articles count: ${resp.data?.articles?.length || 0}`);

          for (const item of resp.data.articles || []) {
            const scraped = await this.scrapeArticle(item, source);
            if (scraped) articles.push(scraped);
          }
        } catch (err: unknown) {
          logger.error(`❌ Error fetching API for ${source.name}: ${(err as Error).message}`);
        }
      }

      logger.info(`✅ Scraped ${articles.length} articles from ${source.name}`);
      return articles;
    } catch (err: unknown) {
      logger.error(`❌ scrapeSource error for ${source.name}: ${(err as Error).message}`);
      return [];
    }
  }

  async scrapeArticle(item: any, source: any): Promise<ScrapedArticle | null> {
    try {
      const title = item.title || "";
      const link = item.link || item.url || "";
      const summary = item.contentSnippet || item.description || item.content || "";
      const publishedAt = item.pubDate
        ? new Date(item.pubDate)
        : item.publishedAt
        ? new Date(item.publishedAt)
        : new Date();

      if (!title || !link) {
        logger.warn(`❌ Skipping item: Missing title/link. Source: ${source.name}`);
        return null;
      }

      const hash = this.generateHash(title + summary + source.id.toString());

      // Skip duplicates
      const existing = await db.article.findUnique({ where: { hash } });
      if (existing) return null;

      const fullContent = source.type === "api" ? summary : await this.fetchArticleContent(link);
      const openGraphData = await this.extractOpenGraphData(link);

      let images: ScrapedArticle["images"] = item.urlToImage
        ? [{ url: item.urlToImage, alt: title, source: "api" }]
        : this.extractImages(fullContent, link, openGraphData);

      if (images.length === 0 && openGraphData.image) {
        images.push({ url: openGraphData.image, alt: title, caption: "Open Graph image", source: "opengraph" });
      }

      const category = await this.determineCategory(title, summary, source.categories);

      const tags = this.extractTags(title, summary, fullContent);

      return {
        title,
        summary: summary.substring(0, 300),
        content: this.cleanContent(fullContent),
        images,
        category: category ?? "general",
        tags,
        author: item.author || this.extractAuthor(fullContent) || source.name,
        lang: source.lang || "en",
        sourceUrl: link,
        publishedAt,
        hash,
        openGraph: openGraphData,
      };

    } catch (err: unknown) {
      logger.error(`❌ scrapeArticle error: ${(err as Error).message}`);
      return null;
    }
  }

  private async fetchArticleContent(url: string): Promise<string> {
    try {
      const resp = await axios.get(url, { timeout: 10000 });
      return resp.data;
    } catch (err: unknown) {
      logger.error(`❌ fetchArticleContent failed: ${url} - ${(err as Error).message}`);
      return "";
    }
  }

  private extractImages(html: string, baseUrl: string, openGraphData?: any) {
    const $ = cheerio.load(html);
    const images: any[] = [];

    $("img").each((_, el) => {
      const src = $(el).attr("src");
      const alt = $(el).attr("alt") || "Article image";
      if (src) {
        const fullUrl = src.startsWith("http") ? src : new URL(src, baseUrl).href;
        images.push({ url: fullUrl, alt, source: "scraped" });
      }
    });

    return [...new Map(images.map((img) => [img.url, img])).values()].slice(0, 5);
  }

  private generateHash(content: string) {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  private async extractOpenGraphData(url: string) {
    try {
      const resp = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(resp.data);

      return {
        image: $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content"),
        title: $('meta[property="og:title"]').attr("content") || $("title").text(),
        description: $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content"),
      };
    } catch {
      return {};
    }
  }

  private async determineCategory(title: string, summary: string, sourceCategories: any[]) {
    const text = (title + " " + summary).toLowerCase();

    const keywords: Record<string, string[]> = {
      politics: ["politics", "government", "election", "president", "senate"],
      world: ["world", "international", "global", "foreign"],
      sports: ["sports", "football", "basketball", "soccer", "tennis"],
      tech: ["technology", "tech", "software", "ai", "computer", "internet"],
      health: ["health", "medical", "doctor", "hospital", "medicine"],
      ai: ["ai", "artificial intelligence", "machine learning"],
      cyber: ["cybersecurity", "hacking", "malware", "ransomware", "breach"],
      movies: ["movies", "film", "cinema", "bollywood", "hollywood"],
      stocks: ["stocks", "market", "shares", "trading", "equity"],
      hindi: ["hindi"],
      telugu: ["telugu"],
    };

    for (const [key, kws] of Object.entries(keywords)) {
      if (kws.some((kw) => text.includes(kw))) {
        return key; // just return string
      }
    }

    return sourceCategories?.[0] ?? null;
  }

  private extractTags(title: string, summary: string, content: string) {
    const words = (title + " " + summary + " " + content).toLowerCase().split(/\W+/).filter(w => w.length > 4);
    return Array.from(new Set(words.slice(0, 10)));
  }

  private extractAuthor(content: string): string | null {
    const match = content.match(/By ([A-Z][a-z]+ [A-Z][a-z]+)/);
    return match ? match[1] : null;
  }

  private cleanContent(html: string): string {
    return cheerio.load(html).text().replace(/\s+/g, " ").trim();
  }
}
