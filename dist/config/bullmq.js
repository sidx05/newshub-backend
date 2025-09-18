"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBullMQ = exports.addPublishingJob = exports.addModerationJob = exports.addPlagiarismJob = exports.addAIRewritingJob = exports.scheduleScrapingJob = exports.createWorkers = exports.publishingQueue = exports.moderationQueue = exports.plagiarismQueue = exports.aiRewritingQueue = exports.scrapingQueue = void 0;
const bullmq_1 = require("bullmq");
const logger_1 = require("../utils/logger");
const job_processor_1 = require("../jobs/job.processor");
// Redis connection config
const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
};
// Create queues
exports.scrapingQueue = new bullmq_1.Queue("scraping", { connection });
exports.aiRewritingQueue = new bullmq_1.Queue("ai-rewriting", { connection });
exports.plagiarismQueue = new bullmq_1.Queue("plagiarism", { connection });
exports.moderationQueue = new bullmq_1.Queue("moderation", { connection });
exports.publishingQueue = new bullmq_1.Queue("publishing", { connection });
// Create job processor instance
const jobProcessor = new job_processor_1.JobProcessor();
// Create workers
const createWorkers = () => {
    // Scraping worker
    const scrapingWorker = new bullmq_1.Worker("scraping", async (job) => {
        logger_1.logger.info(`Processing scraping job: ${job.id}`);
        return await jobProcessor.processScrapingJob(job);
    }, { connection });
    // AI rewriting worker
    const aiRewritingWorker = new bullmq_1.Worker("ai-rewriting", async (job) => {
        logger_1.logger.info(`Processing AI rewriting job: ${job.id}`);
        return await jobProcessor.processAIRewritingJob(job);
    }, { connection });
    // Plagiarism check worker
    const plagiarismWorker = new bullmq_1.Worker("plagiarism", async (job) => {
        logger_1.logger.info(`Processing plagiarism check job: ${job.id}`);
        return await jobProcessor.processPlagiarismJob(job);
    }, { connection });
    // Moderation worker
    const moderationWorker = new bullmq_1.Worker("moderation", async (job) => {
        logger_1.logger.info(`Processing moderation job: ${job.id}`);
        return await jobProcessor.processModerationJob(job);
    }, { connection });
    // Publishing worker
    const publishingWorker = new bullmq_1.Worker("publishing", async (job) => {
        logger_1.logger.info(`Processing publishing job: ${job.id}`);
        return await jobProcessor.processPublishingJob(job);
    }, { connection });
    // Worker event listeners
    [
        scrapingWorker,
        aiRewritingWorker,
        plagiarismWorker,
        moderationWorker,
        publishingWorker,
    ].forEach((worker) => {
        worker.on("completed", (job) => {
            logger_1.logger.info(`Job ${job.id} completed successfully`);
        });
        worker.on("failed", (job, err) => {
            logger_1.logger.error(`Job ${job?.id} failed:`, err);
        });
    });
    return {
        scrapingWorker,
        aiRewritingWorker,
        plagiarismWorker,
        moderationWorker,
        publishingWorker,
    };
};
exports.createWorkers = createWorkers;
// Job scheduling functions
const scheduleScrapingJob = async (sourceId) => {
    try {
        const job = await exports.scrapingQueue.add("scrape-all", { sourceId }, {
            repeat: {
                every: 5 * 60 * 1000, // Every 5 minutes
            },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        logger_1.logger.info(`Scheduled scraping job: ${job.id}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error("Error scheduling scraping job:", error);
        throw error;
    }
};
exports.scheduleScrapingJob = scheduleScrapingJob;
const addAIRewritingJob = async (articleId) => {
    try {
        const job = await exports.aiRewritingQueue.add("rewrite-article", { articleId }, {
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        logger_1.logger.info(`Added AI rewriting job: ${job.id} for article: ${articleId}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error("Error adding AI rewriting job:", error);
        throw error;
    }
};
exports.addAIRewritingJob = addAIRewritingJob;
const addPlagiarismJob = async (articleId) => {
    try {
        const job = await exports.plagiarismQueue.add("check-plagiarism", { articleId }, {
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        logger_1.logger.info(`Added plagiarism check job: ${job.id} for article: ${articleId}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error("Error adding plagiarism job:", error);
        throw error;
    }
};
exports.addPlagiarismJob = addPlagiarismJob;
const addModerationJob = async (articleId) => {
    try {
        const job = await exports.moderationQueue.add("moderate-content", { articleId }, {
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        logger_1.logger.info(`Added moderation job: ${job.id} for article: ${articleId}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error("Error adding moderation job:", error);
        throw error;
    }
};
exports.addModerationJob = addModerationJob;
const addPublishingJob = async (articleId) => {
    try {
        const job = await exports.publishingQueue.add("publish-article", { articleId }, {
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        logger_1.logger.info(`Added publishing job: ${job.id} for article: ${articleId}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error("Error adding publishing job:", error);
        throw error;
    }
};
exports.addPublishingJob = addPublishingJob;
const createBullMQ = () => {
    return {
        scrapingQueue: exports.scrapingQueue,
        aiRewritingQueue: exports.aiRewritingQueue,
        plagiarismQueue: exports.plagiarismQueue,
        moderationQueue: exports.moderationQueue,
        publishingQueue: exports.publishingQueue,
        createWorkers: exports.createWorkers,
        scheduleScrapingJob: exports.scheduleScrapingJob,
        addAIRewritingJob: exports.addAIRewritingJob,
        addPlagiarismJob: exports.addPlagiarismJob,
        addModerationJob: exports.addModerationJob,
        addPublishingJob: exports.addPublishingJob,
    };
};
exports.createBullMQ = createBullMQ;
//# sourceMappingURL=bullmq.js.map