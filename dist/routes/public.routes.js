"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
const router = (0, express_1.Router)();
const publicController = new public_controller_1.PublicController();
// Health check
router.get('/health', publicController.getHealth);
// Articles
router.get('/articles', publicController.getArticles);
router.get('/articles/:slug', publicController.getArticleBySlug);
// Categories
router.get('/categories', publicController.getCategories);
// Trending
router.get('/trending', publicController.getTrending);
// Tickers
router.get('/ticker/active', publicController.getActiveTickers);
exports.default = router;
//# sourceMappingURL=public.routes.js.map