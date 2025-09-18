"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
// Protected routes
router.get('/me', auth_1.authenticate, authController.getProfile);
router.post('/me/save/:articleId', auth_1.authenticate, authController.saveArticle);
router.post('/me/history/:articleId', auth_1.authenticate, authController.addToHistory);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map