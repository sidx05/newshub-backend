"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
class AuthService {
    async register(input) {
        try {
            // Check if user already exists
            const existingUser = await User_1.User.findOne({ email: input.email });
            if (existingUser) {
                throw new Error('User already exists with this email');
            }
            // Create new user
            const user = new User_1.User({
                email: input.email,
                passwordHash: input.password, // Will be hashed by pre-save hook
                role: input.role,
            });
            2;
            await user.save();
            // Generate token
            const token = (0, jwt_1.generateToken)(user);
            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.passwordHash;
            return { user: userResponse, token };
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            throw error;
        }
    }
    async login(input) {
        try {
            // Find user by email
            const user = await User_1.User.findOne({ email: input.email }).select('+passwordHash');
            if (!user) {
                throw new Error('Invalid credentials');
            }
            // Verify password
            const isValidPassword = await user.comparePassword(input.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }
            // Generate token
            const token = (0, jwt_1.generateToken)(user);
            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.passwordHash;
            return { user: userResponse, token };
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            throw error;
        }
    }
    async getProfile(userId) {
        try {
            const user = await User_1.User.findById(userId).populate('savedArticles readingHistory');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Get profile error:', error);
            throw error;
        }
    }
    async saveArticle(userId, articleId) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Add to saved articles if not already saved
            if (!user.savedArticles.includes(articleId)) {
                user.savedArticles.push(articleId);
                await user.save();
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Save article error:', error);
            throw error;
        }
    }
    async addToHistory(userId, articleId) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Remove from history if already exists (to avoid duplicates)
            user.readingHistory = user.readingHistory.filter((id) => id.toString() !== articleId);
            // Add to beginning of history
            user.readingHistory.unshift(articleId);
            // Keep only last 50 articles in history
            if (user.readingHistory.length > 50) {
                user.readingHistory = user.readingHistory.slice(0, 50);
            }
            await user.save();
            return user;
        }
        catch (error) {
            logger_1.logger.error('Add to history error:', error);
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map