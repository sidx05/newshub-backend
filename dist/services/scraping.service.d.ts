export interface ScrapedArticle {
    title: string;
    summary: string;
    content: string;
    images: {
        url: string;
        alt: string;
        caption?: string;
        width?: number;
        height?: number;
        source: "scraped" | "opengraph" | "ai_generated" | "api";
    }[];
    category: string;
    tags: string[];
    author: string;
    lang: string;
    sourceUrl: string;
    publishedAt: Date;
    hash: string;
    openGraph?: {
        image?: string;
        title?: string;
        description?: string;
    };
}
export declare class ScrapingService {
    private rssParser;
    constructor();
    scrapeAllSources(): Promise<ScrapedArticle[]>;
    scrapeSource(source: any): Promise<ScrapedArticle[]>;
    scrapeArticle(item: any, source: any): Promise<ScrapedArticle | null>;
    private fetchArticleContent;
    private extractImages;
    private generateHash;
    private extractOpenGraphData;
    private determineCategory;
    private extractTags;
    private extractAuthor;
    private cleanContent;
    private cleanText;
}
//# sourceMappingURL=scraping.service.d.ts.map