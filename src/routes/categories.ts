// backend/src/routes/categories.ts
import { Router } from "express";
import { Category } from "../models/Category";
import { Article } from "../models/Article";

const router = Router();

/**
 * GET /api/categories
 * → List all categories
 */
router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ order: 1 })
      .select("_id key label icon color order parent");

    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ success: false, error: "Failed to fetch categories" });
  }
});

/**
 * GET /api/categories/:slug
 * → Fetch all articles for a category by slug (key)
 */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ key: slug }).select(
      "_id key label icon color order parent"
    );

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    const articles = await Article.find({
      category: category._id,
      status: "published",
    })
      .populate("category", "key label icon color")
      .populate("sourceId", "name")
      .sort({ publishedAt: -1 });

    res.json({ success: true, category, articles });
  } catch (err) {
    console.error("Error fetching category articles:", err);
    res.status(500).json({ success: false, error: "Failed to fetch category articles" });
  }
});

export default router;
