export interface AIProcessingResult {
    rewritten: boolean;
    content: string;
    summary: string;
    confidence: number;
    seoTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    tags?: string[];
    author?: string;
}
export interface RewriteOptions {
    tone: 'formal' | 'neutral' | 'exciting' | 'breaking';
    length: 'summary' | 'full' | 'detailed';
    focusSeo: boolean;
    urgency: boolean;
}
export declare class AIService {
    private zai;
    constructor();
    private initializeAI;
    rewriteArticle(content: string, title: string, options?: RewriteOptions): Promise<AIProcessingResult>;
    moderateContent(content: string): Promise<{
        approved: boolean;
        reason?: string;
    }>;
    generateSEO(title: string, content: string): Promise<{
        metaDescription: string;
        keywords: string[];
    }>;
    private generateSummary;
    private generateMetaDescription;
    private extractKeywords;
    translateContent(content: string, targetLanguage: 'english' | 'hindi' | 'telugu' | 'spanish' | 'french'): Promise<{
        translated: string;
        confidence: number;
    }>;
    generateImagePrompt(title: string, content: string): Promise<string>;
    generateInfographicData(title: string, content: string): Promise<{
        type: string;
        data: any[];
        title: string;
    }>;
    factCheckContent(content: string): Promise<{
        isReliable: boolean;
        confidence: number;
        issues: string[];
        suggestions: string[];
    }>;
    generateSocialMediaPosts(title: string, content: string, platforms?: ('twitter' | 'linkedin' | 'facebook')[]): Promise<{
        [platform: string]: string;
    }>;
}
//# sourceMappingURL=ai.service.d.ts.map