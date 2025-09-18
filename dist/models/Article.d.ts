import mongoose, { Document } from "mongoose";
export interface IArticle extends Document {
    title: string;
    slug: string;
    summary: string;
    content: string;
    images: Array<{
        url: string;
        alt: string;
        caption?: string;
        width?: number;
        height?: number;
        generated?: boolean;
    }>;
    category: mongoose.Types.ObjectId;
    tags: string[];
    author: string;
    lang: string;
    sourceId: mongoose.Types.ObjectId;
    status: 'draft' | 'published' | 'rejected' | 'needs_review';
    aiInfo: {
        rewritten: boolean;
        confidence: number;
        plagiarismScore: number;
    };
    seo: {
        metaDescription: string;
        keywords: string[];
    };
    factCheck?: {
        isReliable: boolean;
        confidence: number;
        issues: string[];
        suggestions: string[];
        checkedAt: Date;
    };
    socialMedia?: {
        posts: {
            [platform: string]: string;
        };
        generatedAt: Date;
    };
    translations?: Array<{
        title: string;
        content: string;
        summary: string;
        language: string;
        translationConfidence: number;
        translatedAt: Date;
    }>;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    viewCount: number;
    hash: string;
}
export declare const Article: mongoose.Model<IArticle, {}, {}, {}, mongoose.Document<unknown, {}, IArticle, {}, {}> & IArticle & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Article.d.ts.map