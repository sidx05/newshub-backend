import dotenv from "dotenv";
dotenv.config();

import { connectDB, disconnectDB } from "../src/lib/mongoose";
import { Article } from "../src/models/Article";
import { Source } from "../src/models/Source";
import { Category, ICategory } from "../src/models/Category";

async function seed() {
  await connectDB();

  try {
    console.log("🌱 Seeding database...");

    // ----------------------
    // ✅ Define categories in strict order
    // ----------------------
    const categoriesData: Partial<ICategory>[] = [
      { key: "world", label: "World", icon: "globe", color: "#2563eb", order: 1 },
      { key: "india", label: "India", icon: "map", color: "#f97316", order: 2 },
      { key: "business", label: "Business", icon: "briefcase", color: "#0ea5a4", order: 3 },
      { key: "technology", label: "Technology", icon: "cpu", color: "#7c3aed", order: 4 },
      { key: "ai", label: "AI", icon: "bot", color: "#9333ea", order: 5 },
      { key: "sports", label: "Sports", icon: "trophy", color: "#16a34a", order: 6 },
      { key: "science", label: "Science", icon: "flask-conical", color: "#06b6d4", order: 7 },
      { key: "health", label: "Health", icon: "heart", color: "#ef4444", order: 8 },
      { key: "war", label: "War", icon: "shield", color: "#dc2626", order: 9 },
      { key: "entertainment", label: "Entertainment", icon: "film", color: "#ec4899", order: 10 },
      { key: "movies", label: "Movies", icon: "clapperboard", color: "#d946ef", order: 11 },
      { key: "telugu", label: "Telugu", icon: "newspaper", color: "#1d4ed8", order: 12 },
      { key: "hindi", label: "Hindi", icon: "newspaper", color: "#ca8a04", order: 13 },
    ];

    // ----------------------
    // ✅ Upsert categories (keeps IDs stable for order)
    // ----------------------
    const categories: ICategory[] = [];
    for (const cat of categoriesData) {
      const updated = await Category.findOneAndUpdate(
        { key: cat.key },
        { $set: cat },
        { new: true, upsert: true }
      );
      if (updated) categories.push(updated);
    }

    // Build lookup helper
    const catByKey = (k: string) => {
      const found = categories.find((c) => c.key === k);
      if (!found) throw new Error(`Missing category key: ${k}`);
      return found._id;
    };

    // ----------------------
    // ✅ Reset articles and sources
    // ----------------------
    console.log("🌱 Clearing old articles and sources...");
    await Article.deleteMany({});
    await Source.deleteMany({});

    // ----------------------
    // ✅ Insert sources
    // ----------------------
    console.log("🌱 Inserting sources...");
    await Source.insertMany([
      // 🌍 World
      {
        name: "BBC World",
        url: "https://www.bbc.com",
        rssUrls: ["http://feeds.bbci.co.uk/news/world/rss.xml"],
        lang: "en",
        categories: [catByKey("world")],
        active: true,
      },
      {
        name: "The Guardian World",
        url: "https://www.theguardian.com/world",
        rssUrls: ["https://www.theguardian.com/world/rss"],
        lang: "en",
        categories: [catByKey("world")],
        active: true,
      },

      // 🇮🇳 India
      {
        name: "Indian Express",
        url: "https://indianexpress.com",
        rssUrls: ["https://indianexpress.com/section/india/feed/"],
        lang: "en",
        categories: [catByKey("india")],
        active: true,
      },
      {
        name: "Eenadu Andhra Pradesh Politics",
        url: "https://www.eenadu.net",
        rssUrls: ["https://www.eenadu.net/rss/andhra-pradesh-politics"],
        lang: "te",
        categories: [catByKey("india"), catByKey("telugu")],
        active: true,
      },
      {
        name: "Sakshi Telangana Politics",
        url: "https://www.sakshi.com",
        rssUrls: ["https://www.sakshi.com/rss/telangana-politics"],
        lang: "te",
        categories: [catByKey("india"), catByKey("telugu")],
        active: true,
      },
      {
        name: "Firstpost",
        url: "https://www.firstpost.com/",
        rssUrls: ["https://www.firstpost.com/commonfeeds/v1/mfp/rss/web-stories.xml"],
        lang: "hi",
        categories: [catByKey("india")],
        active: true,
      },
      {
        name: "DNA India",
        url: "https://www.dnaindia.com/",
        rssUrls: ["https://www.dnaindia.com/feeds/india.xml"],
        lang: "hi",
        categories: [catByKey("india"), catByKey("hindi")],
        active: true,
      },

      // 💼 Business
      {
        name: "Economic Times",
        url: "https://economictimes.indiatimes.com",
        rssUrls: ["https://economictimes.indiatimes.com/rssfeedsdefault.cms"],
        lang: "en",
        categories: [catByKey("business")],
        active: true,
      },

      // 🤖 Technology
      {
        name: "Hacker News",
        url: "https://news.ycombinator.com",
        rssUrls: ["https://news.ycombinator.com/rss"],
        lang: "en",
        categories: [catByKey("technology")],
        active: true,
      },
      {
        name: "VentureBeat Tech",
        url: "https://venturebeat.com",
        rssUrls: ["https://venturebeat.com/category/technology/feed/"],
        lang: "en",
        categories: [catByKey("technology")],
        active: true,
      },

      // 🧠 Artificial Intelligence
      {
        name: "VentureBeat AI",
        url: "https://venturebeat.com",
        rssUrls: ["https://venturebeat.com/category/ai/feed/"],
        lang: "en",
        categories: [catByKey("ai")],
        active: true,
      },
      {
        name: "MIT Technology Review - AI",
        url: "https://www.technologyreview.com",
        rssUrls: ["https://www.technologyreview.com/feed/ai/"],
        lang: "en",
        categories: [catByKey("ai")],
        active: true,
      },
      {
        name: "The Verge - AI",
        url: "https://www.theverge.com/ai-artificial-intelligence",
        rssUrls: ["https://www.theverge.com/rss/ai/index.xml"],
        lang: "en",
        categories: [catByKey("ai")],
        active: true,
      },
      {
        name: "ZDNet AI",
        url: "https://www.zdnet.com/topic/artificial-intelligence/",
        rssUrls: ["https://www.zdnet.com/topic/artificial-intelligence/rss.xml"],
        lang: "en",
        categories: [catByKey("ai")],
        active: true,
      },

      // 🏅 Sports
      {
        name: "ESPN",
        url: "https://www.espn.com",
        rssUrls: ["https://www.espn.com/espn/rss/news"],
        lang: "en",
        categories: [catByKey("sports")],
        active: true,
      },

      // ⚔ War 
      {
        name: "Al Jazeera - Middle East",
        url: "https://www.aljazeera.com/middle-east/",
        rssUrls: ["https://www.aljazeera.com/xml/rss/middleeast.xml"],
        lang: "en",
        categories: [catByKey("war")],
        active: true,
      },
      {
        name: "Guardian - War & Conflict",
        url: "https://www.theguardian.com/world/series/ukraine-live",
        rssUrls: ["https://www.theguardian.com/world/series/ukraine-live/rss"],
        lang: "en",
        categories: [catByKey("war")],
        active: true,
      },
      {
        name: "Reuters - World News",
        url: "https://www.reuters.com/world/",
        rssUrls: ["https://feeds.reuters.com/Reuters/worldNews"],
        lang: "en",
        categories: [catByKey("war")],
        active: true,
      },
      {
        name: "Conflict News (Unofficial)",
        url: "https://conflictobserver.com",
        rssUrls: ["https://www.conflictobserver.com/rss"],
        lang: "en",
        categories: [catByKey("war")],
        active: true,
      },

      // 🔬 Science
      {
        name: "ScienceDaily",
        url: "https://www.sciencedaily.com",
        rssUrls: ["https://www.sciencedaily.com/rss/top/science.xml"],
        lang: "en",
        categories: [catByKey("science")],
        active: true,
      },

      // ❤️ Health
      {
        name: "WHO News",
        url: "https://www.who.int",
        rssUrls: ["https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml"],
        lang: "en",
        categories: [catByKey("health")],
        active: true,
      },
      {
        name: "MyFitnessPal Blog",
        url: "https://blog.myfitnesspal.com/",
        rssUrls: ["https://blog.myfitnesspal.com/feed/"],
        lang: "en",
        categories: [catByKey("health")],
        active: true,
      },
      {
        name: "MedCity News",
        url: "https://medcitynews.com/",
        rssUrls: ["https://medcitynews.com/feed/"],
        lang: "en",
        categories: [catByKey("health")],
        active: true,
      },
      { name: "manatelangana news",
        url: "https://www.manatelangana.news/",
        rssUrls: ["https://www.manatelangana.news/feed/"],
        lang: "en",
        categories: [catByKey("health")],
        active: true,
      },

      // 🎬 Entertainment
      {
        name: "Hollywood Reporter Entertainment",
        url: "https://www.hollywoodreporter.com",
        rssUrls: ["https://www.hollywoodreporter.com/t/entertainment/feed/"],
        lang: "en",
        categories: [catByKey("entertainment")],
        active: true,
      },

      // 🎥 Movies (child of entertainment)
      {
        name: "Hollywood Reporter Movies",
        url: "https://www.hollywoodreporter.com",
        rssUrls: ["https://www.hollywoodreporter.com/t/movies/feed/"],
        lang: "en",
        categories: [catByKey("movies"), catByKey("entertainment")],
        active: true,
      },

      // 📰 Telugu
      {
        name: "Eenadu Telugu",
        url: "https://www.eenadu.net",
        rssUrls: ["https://telugu.hindustantimes.com/rss/andhra-pradesh"],
        lang: "te",
        categories: [catByKey("telugu")],
        active: true,
      },

      // 📰 Hindi
      {
        name: "Amar Ujala",
        url: "https://www.amarujala.com",
        rssUrls: ["https://feeds.feedburner.com/ndtvkhabar-latest"],
        lang: "hi",
        categories: [catByKey("hindi")],
        active: true,
      },
      {
        name: "NDTV",
        url: "https://www.ndtv.com/",
        rssUrls: ["https://feeds.feedburner.com/NDTV-LatestNews"],
        lang: "hi",
        categories: [catByKey("hindi")],
        active: true,
      },
      {
        name: "Navjivan India",
        url: "https://www.navjivanindia.com/",
        rssUrls: ["https://www.navjivanindia.com/stories.rss"],
        lang: "hi",
        categories: [catByKey("hindi")],
        active: true,
      }

    ]);

    console.log("✅ Seeding complete.");
  } catch (err) {
    console.error("❌ Error seeding:", err);
  } finally {
    await disconnectDB();
  }
}

seed();
