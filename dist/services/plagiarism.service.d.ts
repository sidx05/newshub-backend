export interface PlagiarismResult {
    score: number;
    matches: PlagiarismMatch[];
    approved: boolean;
}
export interface PlagiarismMatch {
    source: string;
    similarity: number;
    url?: string;
}
export declare class PlagiarismService {
    private apiKey;
    constructor();
    checkPlagiarism(content: string, title: string): Promise<PlagiarismResult>;
    private performPlagiarismCheck;
    batchCheckPlagiarism(articles: Array<{
        content: string;
        title: string;
    }>): Promise<PlagiarismResult[]>;
}
//# sourceMappingURL=plagiarism.service.d.ts.map