// backend/src/routes/public.routes.ts
import { Router } from "express";
import { PublicController } from "../controllers/public.controller";

const router = Router();
const publicController = new PublicController();

// Keep the same paths you used in the controller
router.get("/health", publicController.getHealth);

// Articles
router.get("/articles", publicController.getArticles);
router.get("/articles/:slug", publicController.getArticleBySlug);

// Trending
router.get("/trending", publicController.getTrending);

// Tickers
router.get("/ticker/active", publicController.getActiveTickers);

export default router;
