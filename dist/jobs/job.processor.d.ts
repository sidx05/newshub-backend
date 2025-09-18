import { Job } from 'bullmq';
export declare class JobProcessor {
    private scrapingService;
    private aiService;
    private plagiarismService;
    constructor();
    processScrapingJob(job: Job): Promise<{
        success: boolean;
        totalArticles: number;
        successfulArticles: number;
    }>;
    processAIRewritingJob(job: Job): Promise<{
        success: boolean;
        rewritten: boolean;
        confidence: number;
    }>;
    processPlagiarismJob(job: Job): Promise<{
        success: boolean;
        plagiarismScore: number;
        approved: boolean;
    }>;
    processModerationJob(job: Job): Promise<{
        success: boolean;
        approved: boolean;
        reason: string | undefined;
    }>;
    processPublishingJob(job: Job): Promise<{
        success: boolean;
        publishedAt: Date;
    }>;
    processImageGenerationJob(job: Job): Promise<{
        success: boolean;
        imagesGenerated: number;
    }>;
    processFactCheckJob(job: Job): Promise<{
        isReliable: boolean;
        confidence: number;
        issues: string[];
        suggestions: string[];
        success: boolean;
    }>;
    processSocialMediaJob(job: Job): Promise<{
        success: boolean;
        posts: {
            [platform: string]: string;
        };
    }>;
    processTranslationJob(job: Job): Promise<{
        translated: string;
        confidence: number;
        success: boolean;
    }>;
    private processScrapedArticle;
    private generateSummary;
}
//# sourceMappingURL=job.processor.d.ts.map