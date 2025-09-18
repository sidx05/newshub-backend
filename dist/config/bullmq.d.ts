import { Queue, Worker } from "bullmq";
export declare const scrapingQueue: Queue<any, any, string, any, any, string>;
export declare const aiRewritingQueue: Queue<any, any, string, any, any, string>;
export declare const plagiarismQueue: Queue<any, any, string, any, any, string>;
export declare const moderationQueue: Queue<any, any, string, any, any, string>;
export declare const publishingQueue: Queue<any, any, string, any, any, string>;
export declare const createWorkers: () => {
    scrapingWorker: Worker<any, any, string>;
    aiRewritingWorker: Worker<any, any, string>;
    plagiarismWorker: Worker<any, any, string>;
    moderationWorker: Worker<any, any, string>;
    publishingWorker: Worker<any, any, string>;
};
export declare const scheduleScrapingJob: (sourceId?: string) => Promise<import("bullmq").Job<any, any, string>>;
export declare const addAIRewritingJob: (articleId: string) => Promise<import("bullmq").Job<any, any, string>>;
export declare const addPlagiarismJob: (articleId: string) => Promise<import("bullmq").Job<any, any, string>>;
export declare const addModerationJob: (articleId: string) => Promise<import("bullmq").Job<any, any, string>>;
export declare const addPublishingJob: (articleId: string) => Promise<import("bullmq").Job<any, any, string>>;
export declare const createBullMQ: () => {
    scrapingQueue: Queue<any, any, string, any, any, string>;
    aiRewritingQueue: Queue<any, any, string, any, any, string>;
    plagiarismQueue: Queue<any, any, string, any, any, string>;
    moderationQueue: Queue<any, any, string, any, any, string>;
    publishingQueue: Queue<any, any, string, any, any, string>;
    createWorkers: () => {
        scrapingWorker: Worker<any, any, string>;
        aiRewritingWorker: Worker<any, any, string>;
        plagiarismWorker: Worker<any, any, string>;
        moderationWorker: Worker<any, any, string>;
        publishingWorker: Worker<any, any, string>;
    };
    scheduleScrapingJob: (sourceId?: string) => Promise<import("bullmq").Job<any, any, string>>;
    addAIRewritingJob: (articleId: string) => Promise<import("bullmq").Job<any, any, string>>;
    addPlagiarismJob: (articleId: string) => Promise<import("bullmq").Job<any, any, string>>;
    addModerationJob: (articleId: string) => Promise<import("bullmq").Job<any, any, string>>;
    addPublishingJob: (articleId: string) => Promise<import("bullmq").Job<any, any, string>>;
};
//# sourceMappingURL=bullmq.d.ts.map