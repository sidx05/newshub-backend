"use strict";
/// <reference path="./types/express.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./config/database"));
const redis_1 = require("redis");
const bullmq_1 = require("./config/bullmq");
const routes_1 = require("./routes");
const middleware_1 = require("./middleware");
const logger_1 = require("./utils/logger");
const swagger_1 = require("./config/swagger");
const public_routes_1 = __importDefault(require("./routes/public.routes"));
exports.app = (0, express_1.default)();
dotenv_1.default.config();
const PORT = parseInt(process.env.PORT || "3001", 10);
// Connect to MongoDB
(0, database_1.default)();
// Initialize Redis client
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.redisClient.on('error', (err) => {
    logger_1.logger.error('Redis Client Error:', err);
});
exports.redisClient.on('connect', () => {
    logger_1.logger.info('Connected to Redis');
});
async function startServer() {
    try {
        // Connect Redis
        await exports.redisClient.connect();
        // Setup middleware
        (0, middleware_1.setupMiddleware)(exports.app);
        exports.app.use(express_1.default.json());
        // Setup routes
        (0, routes_1.setupRoutes)(exports.app);
        // Setup Swagger
        (0, swagger_1.setupSwagger)(exports.app);
        exports.app.use("/api", public_routes_1.default);
        // Initialize BullMQ and schedule jobs
        const bullmq = (0, bullmq_1.createBullMQ)();
        // Schedule recurring scraping job
        (0, bullmq_1.scheduleScrapingJob)().catch((error) => {
            logger_1.logger.error('Failed to schedule scraping job:', error);
        });
        // Health check endpoint
        exports.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
            });
        });
        // Error handling middleware
        exports.app.use((err, req, res, next) => {
            logger_1.logger.error('Error:', err);
            res.status(500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
            });
        });
        // 404 handler
        exports.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });
        // Start server
        exports.app.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
            logger_1.logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
        });
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger_1.logger.info('SIGTERM received, shutting down gracefully');
            await exports.redisClient.quit();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            logger_1.logger.info('SIGINT received, shutting down gracefully');
            await exports.redisClient.quit();
            process.exit(0);
        });
    }
    catch (err) {
        logger_1.logger.error('Startup error:', err);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map