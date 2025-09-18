"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const crypto_1 = __importDefault(require("crypto"));
const models_1 = require("../models");
const logger_1 = require("../utils/logger");
class ScrapingService {
    constructor() {
        this.rssParser = new rss_parser_1.default();
    }
    // Scrape ALL sources from DB
    async scrapeAllSources() {
        try {
            logger_1.logger.info("Starting scraping for all sources");
            const sources = await models_1.Source.find({ active: true });
            let allArticles = [];
            for (const source of sources) {
                try {
                    const articles = await this.scrapeSource(source);
                    for (const scraped of articles) {
                        const article = new models_1.Article({
                            title: scraped.title,
                            summary: scraped.summary,
                            content: scraped.content,
                            images: scraped.images,
                            category: scraped.category,
                            tags: scraped.tags,
                            author: scraped.author,
                            lang: scraped.lang,
                            sourceUrl: scraped.sourceUrl,
                            publishedAt: scraped.publishedAt,
                            hash: scraped.hash,
                            aiInfo: { rewritten: false, plagiarismScore: null },
                            status: "draft",
                            sourceId: source._id,
                        });
                        await article.save();
                    }
                    allArticles = allArticles.concat(articles);
                    await models_1.Source.findByIdAndUpdate(source._id, { lastScraped: new Date() });
                }
                catch (err) {
                    logger_1.logger.error(`Error scraping source ${source.name}`, err);
                }
            }
            logger_1.logger.info(`Scraping completed. Total: ${allArticles.length}`);
            return allArticles;
        }
        catch (err) {
            logger_1.logger.error("scrapeAllSources error", err);
            return [];
        }
    }
    // Scrape a single source (RSS or API)
    async scrapeSource(source) {
        try {
            logger_1.logger.info(`Scraping source: ${source.name}`);
            const articles = [];
            // Example: RSS scraping
            if (source.rssUrls && source.rssUrls.length > 0) {
                for (const rssUrl of source.rssUrls) {
                    try {
                        const feed = await this.rssParser.parseURL(rssUrl);
                        for (const item of feed.items) {
                            const scraped = await this.scrapeArticle(item, source);
                            if (scraped)
                                articles.push(scraped);
                        }
                    }
                    catch (err) {
                        logger_1.logger.error(`Error parsing RSS feed ${rssUrl}`, err);
                    }
                }
            }
            // Example: API scraping (simplified)
            if (source.type === "api" && source.apiUrl) {
                try {
                    const resp = await axios_1.default.get(source.apiUrl, {
                        headers: { "X-API-KEY": process.env.API_KEY || "" },
                    });
                    if (resp.data?.articles) {
                        for (const item of resp.data.articles) {
                            const scraped = await this.scrapeArticle(item, source);
                            if (scraped)
                                articles.push(scraped);
                        }
                    }
                }
                catch (err) {
                    logger_1.logger.error(`Error fetching API for ${source.name}`, err);
                }
            }
            logger_1.logger.info(`Scraped ${articles.length} from ${source.name}`);
            return articles;
        }
        catch (err) {
            logger_1.logger.error(`scrapeSource error for ${source.name}`, err);
            return [];
        }
    }
    // Scrape a single article
    async scrapeArticle(item, source) {
        try {
            const title = item.title || "";
            const link = item.link || item.url || "";
            const summary = item.contentSnippet || item.description || "";
            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
            if (!title || !link)
                return null;
            const fullContent = await this.fetchArticleContent(link);
            const openGraphData = await this.extractOpenGraphData(link);
            const images = this.extractImages(fullContent, link, openGraphData);
            if (images.length === 0 && openGraphData.image) {
                images.push({
                    url: openGraphData.image,
                    alt: title,
                    caption: "Open Graph image",
                    source: "opengraph",
                });
            }
            const hash = this.generateHash(title + summary + source._id.toString());
            // Skip duplicates
            const existing = await models_1.Article.findOne({ hash });
            if (existing)
                return null;
            const category = await this.determineCategory(title, summary, source.categories);
            const tags = this.extractTags(title, summary, fullContent);
            return {
                title,
                summary: summary.substring(0, 300),
                content: this.cleanContent(fullContent),
                images,
                category: category ? category._id.toString() : "general",
                tags,
                author: this.extractAuthor(fullContent) || source.name,
                lang: source.lang || "en",
                sourceUrl: link,
                publishedAt,
                hash,
                openGraph: openGraphData,
            };
        }
        catch (err) {
            logger_1.logger.error("scrapeArticle error", err);
            return null;
        }
    }
    // Fetch article HTML content
    async fetchArticleContent(url) {
        try {
            const resp = await axios_1.default.get(url, { timeout: 10000 });
            return resp.data;
        }
        catch (err) {
            logger_1.logger.error(`fetchArticleContent failed: ${url}`, err);
            return "";
        }
    }
    // Extract images
    extractImages(html, baseUrl, openGraphData) {
        const $ = cheerio.load(html);
        const images = [];
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
    // Generate SHA256 hash
    generateHash(content) {
        return crypto_1.default.createHash("sha256").update(content).digest("hex");
    }
    // Extract OpenGraph metadata
    async extractOpenGraphData(url) {
        try {
            const resp = await axios_1.default.get(url, { timeout: 10000 });
            const $ = cheerio.load(resp.data);
            return {
                image: $('meta[property="og:image"]').attr("content") ||
                    $('meta[name="twitter:image"]').attr("content"),
                title: $('meta[property="og:title"]').attr("content") || $("title").text(),
                description: $('meta[property="og:description"]').attr("content") ||
                    $('meta[name="description"]').attr("content"),
            };
        }
        catch (err) {
            logger_1.logger.error(`extractOpenGraphData failed: ${url}`, err);
            return {};
        }
    }
    // Categorization
    async determineCategory(title, summary, sourceCategories) {
        try {
            const text = (title + " " + summary).toLowerCase();
            const categoryKeywords = {
                politics: ["politics", "government", "election", "president", "senate"],
                sports: ["sports", "football", "basketball", "soccer", "tennis"],
                tech: ["technology", "tech", "software", "ai", "computer", "internet"],
                health: ["health", "medical", "doctor", "hospital", "medicine"],
                world: ["world", "international", "global", "foreign"],
                business: ["business", "economy", "market", "stock", "finance"],
                entertainment: ["entertainment", "movie", "film", "music", "celebrity"],
                science: ["science", "research", "study", "discovery", "scientist"],
            };
            for (const [key, keywords] of Object.entries(categoryKeywords)) {
                if (keywords.some((kw) => text.includes(kw))) {
                    const category = await models_1.Category.findOne({ key });
                    if (category)
                        return category;
                }
            }
            if (sourceCategories?.length > 0)
                return sourceCategories[0];
            return ((await models_1.Category.findOne({ key: "general" })) || (await models_1.Category.findOne()));
        }
        catch (err) {
            logger_1.logger.error("determineCategory error:", err);
            return null;
        }
    }
    // Tags from content
    extractTags(title, summary, content) {
        const words = (title + " " + summary + " " + content)
            .toLowerCase()
            .split(/\W+/)
            .filter((w) => w.length > 4);
        return Array.from(new Set(words.slice(0, 10)));
    }
    // Extract author
    extractAuthor(content) {
        if (content.includes("By ")) {
            const match = content.match(/By ([A-Z][a-z]+ [A-Z][a-z]+)/);
            return match ? match[1] : null;
        }
        return null;
    }
    // Clean HTML into plain text
    cleanContent(html) {
        return cheerio.load(html).text().replace(/\s+/g, " ").trim();
    }
    cleanText(text) {
        return text.replace(/\s+/g, " ").trim();
    }
}
exports.ScrapingService = ScrapingService;
//# sourceMappingURL=scraping.service.js.map