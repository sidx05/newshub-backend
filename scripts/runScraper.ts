import dotenv from "dotenv";
dotenv.config();

import Parser from "rss-parser";
import axios from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto";

import { connectDB, disconnectDB, mongoose } from "../src/lib/mongoose";
import { Source } from "../src/models/Source";
import { Article } from "../src/models/Article";
import { Category } from "../src/models/Category";
import { logger } from "../src/utils/logger";

const parser = new Parser();

function truncate(str: string | undefined | null, n: number) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function generateHash(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}


async function resolveCategoryId(raw: any, fallbackId: any): Promise<any> {
    if (!raw) return fallbackId;
  
    // Handle the specific object format from RSS feeds like { _: 'Sports', '$': {} }
    if (typeof raw === 'object' && raw !== null && typeof raw._ === 'string') {
      const categoryName = raw._;
      const byKey = await Category.findOne({ key: new RegExp(`^${categoryName}$`, 'i') });
      if (byKey) return byKey._id;
      const byLabel = await Category.findOne({ label: new RegExp(`^${categoryName}$`, 'i') });
      if (byLabel) return byLabel._id;
    }
    
    // Handle string names directly
    if (typeof raw === "string") {
      if (mongoose.Types.ObjectId.isValid(raw)) return raw;
      const byKey = await Category.findOne({ key: new RegExp(`^${raw}$`, 'i') });
      if (byKey) return byKey._id;
      const byLabel = await Category.findOne({ label: new RegExp(`^${raw}$`, 'i') });
      if (byLabel) return byLabel._id;
    }
  
    // Handle arrays by iterating through them
    if (Array.isArray(raw)) {
      for (const item of raw) {
        const result = await resolveCategoryId(item, null);
        if (result) return result; // Return the first match found
      }
    }
  
    // Handle mongoose documents or objects with an _id
    if (typeof raw === 'object' && raw !== null && raw._id && mongoose.Types.ObjectId.isValid(raw._id)) {
      return raw._id;
    }
  
    return fallbackId;
}
  

async function ensureFallbackCategory() {
  let fallback = await Category.findOne({ key: "uncategorized" });
  if (!fallback) {
    fallback = await Category.create({
      key: "uncategorized",
      label: "Uncategorized",
      icon: "newspaper",
      color: "#9CA3AF",
      order: 999,
      active: true,
    });
    logger.info("✅ Created fallback category: Uncategorized");
  }
  return fallback;
}

async function scrape() {
  await connectDB();

  const fallback = await ensureFallbackCategory();
  const sources = await Source.find({ active: true });

  logger.info(`🔹 Found ${sources.length} active sources`);
  let totalSaved = 0;

  for (const source of sources) {
    logger.info(`🔹 Scraping: ${source.name}`);

    for (const rssUrl of source.rssUrls) {
      try {
        const feed = await parser.parseURL(rssUrl);

        for (const item of feed.items) {
          try {
            let content = item.contentSnippet || "";
            let image: string | null = null;
            let altText: string | null = null;

            if (item.link) {
              try {
                const { data } = await axios.get(item.link, {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9",
                  },
                  timeout: 15000,
                });

                const $ = cheerio.load(data);
                
                const imageUrl = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content") || null;
                image = imageUrl || $("img").first().attr("src") || null;
                
                altText = $('meta[property="og:image:alt"]').attr("content") || item.title || "Article image";

                content = $("p").text().trim().slice(0, 5000);
              } catch (err) {
                logger.error(`Failed to fetch article body for ${item.link}: ${err}`);
              }
            }

            const hash = generateHash(
              item.link || item.title || JSON.stringify(item).slice(0, 200)
            );

            const exists = await Article.findOne({ hash });
            if (exists) {
              continue;
            }

            
            let categoryId = await resolveCategoryId(item.categories, null);

            // If the article's own categories didn't match anything, fall back to the source's category
            if (!categoryId) {
                categoryId = await resolveCategoryId(source.categories?.[0], fallback._id);
            }
            
            
            const articleDoc = new Article({
              title: item.title || "Untitled",
              images: image ? [{ url: image, alt: altText || item.title || "Article image" }] : [],
              slug:
                (item.title || "untitled")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "") +
                "-" +
                Date.now(),
              summary: truncate(
                item.contentSnippet || content || item.title || "No summary",
                300
              ),
              content:
                content || item.contentSnippet || item.title || "No content available",
              category: categoryId,
              tags: [],
              author: item.creator || item.author || source.name || "Unknown",
              lang: source.lang || "en",
              sourceId: source._id,
              status: "published",
              aiInfo: { rewritten: false, plagiarismScore: 0 },
              seo: {
                metaDescription: truncate(
                  item.contentSnippet || content || item.title || "",
                  160
                ),
                keywords: [],
              },
              publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
              hash,
            });

            await articleDoc.save();
            totalSaved++;
            logger.info(`✅ Saved: ${truncate(articleDoc.title, 60)}`);
          } catch (innerErr) {
            logger.error(`Error saving article from ${rssUrl}: ${innerErr}`);
          }
        }
      } catch (err) {
        logger.error(`Error scraping RSS for ${source.name}: ${err}`);
      }
    }
  }

  logger.info(`✅ Scraping completed. Total articles saved: ${totalSaved}`);
  await disconnectDB();
}

scrape().catch((err) => {
  logger.error("Fatal error in scraper", err);
  disconnectDB();
});