"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const articleSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    content: {
        type: String,
        required: true
    },
    images: [{
            url: {
                type: String,
                required: true,
                trim: true
            },
            alt: {
                type: String,
                required: true,
                trim: true
            },
            caption: {
                type: String,
                trim: true
            },
            width: {
                type: Number
            },
            height: {
                type: Number
            },
            generated: {
                type: Boolean,
                default: false
            }
        }],
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    tags: [{
            type: String,
            trim: true
        }],
    author: {
        type: String,
        required: true,
        trim: true
    },
    lang: {
        type: String,
        required: true,
        default: 'en'
    },
    sourceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Source',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'rejected', 'needs_review'],
        default: 'draft'
    },
    aiInfo: {
        rewritten: {
            type: Boolean,
            default: false
        },
        confidence: {
            type: Number,
            default: 0
        },
        plagiarismScore: {
            type: Number,
            default: 0
        }
    },
    seo: {
        metaDescription: {
            type: String,
            trim: true,
            maxlength: 160
        },
        keywords: [{
                type: String,
                trim: true
            }]
    },
    factCheck: {
        isReliable: {
            type: Boolean,
            default: true
        },
        confidence: {
            type: Number,
            default: 50
        },
        issues: [{
                type: String,
                trim: true
            }],
        suggestions: [{
                type: String,
                trim: true
            }],
        checkedAt: {
            type: Date,
            default: Date.now
        }
    },
    socialMedia: {
        posts: {
            type: Map,
            of: String
        },
        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    translations: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            content: {
                type: String,
                required: true
            },
            summary: {
                type: String,
                required: true,
                trim: true
            },
            language: {
                type: String,
                required: true,
                trim: true
            },
            translationConfidence: {
                type: Number,
                default: 0
            },
            translatedAt: {
                type: Date,
                default: Date.now
            }
        }],
    publishedAt: {
        type: Date
    },
    viewCount: {
        type: Number,
        default: 0
    },
    hash: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});
// Generate slug before saving
articleSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = (0, slugify_1.default)(this.title, { lower: true, strict: true });
    }
    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});
// Create indexes
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ lang: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ viewCount: -1 });
exports.Article = mongoose_1.default.model('Article', articleSchema);
//# sourceMappingURL=Article.js.map