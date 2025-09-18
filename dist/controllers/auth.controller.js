"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const validation_1 = require("../utils/validation");
const logger_1 = require("../utils/logger");
class AuthController {
    constructor() {
        this.register = async (req, res) => {
            try {
                // Validate input
                const validatedData = validation_1.registerSchema.parse(req.body);
                // Register user
                const result = await this.authService.register(validatedData);
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result,
                });
            }
            catch (error) {
                logger_1.logger.error('Registration controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'User already exists with this email') {
                        return res.status(409).json({
                            success: false,
                            error: 'Conflict',
                            message: error.message,
                        });
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to register user',
                });
            }
        };
        this.login = async (req, res) => {
            try {
                // Validate input
                const validatedData = validation_1.loginSchema.parse(req.body);
                // Login user
                const result = await this.authService.login(validatedData);
                res.json({
                    success: true,
                    message: 'Login successful',
                    data: result,
                });
            }
            catch (error) {
                logger_1.logger.error('Login controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'Invalid credentials') {
                        return res.status(401).json({
                            success: false,
                            error: 'Unauthorized',
                            message: error.message,
                        });
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to login',
                });
            }
        };
        this.getProfile = async (req, res) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized',
                        message: 'Authentication required',
                    });
                }
                const profile = await this.authService.getProfile(req.user.userId);
                res.json({
                    success: true,
                    data: profile,
                });
            }
            catch (error) {
                logger_1.logger.error('Get profile controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: error.message,
                        });
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to get profile',
                });
            }
        };
        this.saveArticle = async (req, res) => {
            try {
                const { articleId } = req.params;
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized',
                        message: 'Authentication required',
                    });
                }
                const user = await this.authService.saveArticle(req.user.userId, articleId);
                res.json({
                    success: true,
                    message: 'Article saved successfully',
                    data: user,
                });
            }
            catch (error) {
                logger_1.logger.error('Save article controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: error.message,
                        });
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to save article',
                });
            }
        };
        this.addToHistory = async (req, res) => {
            try {
                const { articleId } = req.params;
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized',
                        message: 'Authentication required',
                    });
                }
                const user = await this.authService.addToHistory(req.user.userId, articleId);
                res.json({
                    success: true,
                    message: 'Article added to history',
                    data: user,
                });
            }
            catch (error) {
                logger_1.logger.error('Add to history controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: error.message,
                        });
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to add to history',
                });
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map