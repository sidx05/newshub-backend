// backend/src/routes/articles.ts

import { Router } from "express";
import { Article } from "../models/Article";
import { Category } from "../models/Category";

const router = Router();

/**
 * GET /api/articles
 * → Fetch all published articles (optionally filter by category, search, limit)
 * Query params:
 *    ?category=slug
 *    ?search=keyword
 *    ?limit=20
 */
router.get("/", async (req, res) => {
  try {
    const { category, search, limit } = req.query;

    const query: any = { status: "published" };

    // Optional: filter by category slug
    if (category) {
      const cat = await Category.findOne({ key: category });
      if (cat) query.category = cat._id;
    }

    // Optional: text search
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { content: { $regex: search as string, $options: "i" } },
      ];
    }

    const articles = await Article.find(query)
      .populate("category", "key label icon color")
      .populate("sourceId", "name")
      .sort({ publishedAt: -1 })
      .limit(limit ? parseInt(limit as string, 10) : 50);

    res.json({ success: true, data: articles });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ success: false, error: "Failed to fetch articles" });
  }
});

/**
 * GET /api/articles/:id
 * → Fetch single article by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate("category", "key label icon color")
      .populate("sourceId", "name");

    if (!article) {
      return res.status(404).json({ success: false, error: "Article not found" });
    }

    res.json({ success: true, data: article });
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({ success: false, error: "Failed to fetch article" });
  }
});

export default router;
