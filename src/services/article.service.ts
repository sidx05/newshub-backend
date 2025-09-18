import { Article, Category } from '../models';
import { GetArticlesQuery, GetTrendingQuery } from '../utils/validation';
import { redisClient } from '../index';
import { logger } from '../utils/logger';

export class ArticleService {
  async getArticles(query: GetArticlesQuery) {
    try {
      const {
        category,
        lang,
        search,
        sort = 'latest',
        page = '1',
        limit = '10',
      } = query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const filter: any = { status: 'published' };

      if (category) {
        filter.category = category;
      }

      if (lang) {
        filter.lang = lang;
      }

      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort
      let sortOptions: any = {};
      switch (sort) {
        case 'popular':
          sortOptions = { viewCount: -1, publishedAt: -1 };
          break;
        case 'trending':
          sortOptions = { viewCount: -1, publishedAt: -1 };
          break;
        case 'latest':
        default:
          sortOptions = { publishedAt: -1 };
          break;
      }

      // Get articles
      const articles = await Article.find(filter)
        .select('title summary slug publishedAt images category sourceId')
        .populate('category', 'key label icon color')
        .populate('sourceId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      // Get total count
      const total = await Article.countDocuments(filter);

      return {
        articles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      logger.error('Get articles error:', error);
      throw error;
    }
  }

  async getArticleBySlug(slug: string) {
    try {
      // Try to get from cache first
      const cacheKey = `article:${slug}`;
      const cachedArticle = await redisClient.get(cacheKey);
      
      if (typeof cachedArticle === 'string') {
        return JSON.parse(cachedArticle);
      }

      // Get from database
      const article = await Article.findOne({ slug, status: 'published' })
        .populate('category', 'key label icon color')
        .populate('sourceId', 'name');

      if (!article) {
        throw new Error('Article not found');
      }

      // Increment view count
      await Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } });

      // Cache for 1 hour
      await redisClient.setex(cacheKey, 3600, JSON.stringify(article));

      return article;
    } catch (error) {
      logger.error('Get article by slug error:', error);
      throw error;
    }
  }

  async getTrending(query: GetTrendingQuery) {
    try {
      const { limit = '10' } = query;
      const limitNum = parseInt(limit);

      // Try to get from cache first
      const cacheKey = `trending:${limit}`;
      const cachedTrending = await redisClient.get(cacheKey);
      
      if (typeof cachedTrending === 'string') {
        return JSON.parse(cachedTrending);
      }

      // Get trending articles (published in last 7 days with most views)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const trending = await Article.find({
        status: 'published',
        publishedAt: { $gte: sevenDaysAgo },
      })
        .populate('category', 'key label icon color')
        .populate('sourceId', 'name')
        .sort({ viewCount: -1, publishedAt: -1 })
        .limit(limitNum);

      // Cache for 30 minutes
      await redisClient.setex(cacheKey, 1800, JSON.stringify(trending));

      return trending;
    } catch (error) {
      logger.error('Get trending error:', error);
      throw error;
    }
  }

  async createArticle(data: any) {
    try {
      const article = new Article(data);
      await article.save();
      return article;
    } catch (error) {
      logger.error('Create article error:', error);
      throw error;
    }
  }

  async updateArticle(id: string, data: any) {
    try {
      const article = await Article.findByIdAndUpdate(id, data, { new: true });
      if (!article) {
        throw new Error('Article not found');
      }
      return article;
    } catch (error) {
      logger.error('Update article error:', error);
      throw error;
    }
  }

  async publishArticle(id: string) {
    try {
      const article = await Article.findByIdAndUpdate(
        id,
        { 
          status: 'published',
          publishedAt: new Date(),
        },
        { new: true }
      );
      
      if (!article) {
        throw new Error('Article not found');
      }

      // Clear relevant caches
      await this.clearArticleCaches();

      return article;
    } catch (error) {
      logger.error('Publish article error:', error);
      throw error;
    }
  }

  private async clearArticleCaches() {
    try {
      // Clear trending cache
      const keys = await redisClient.keys('trending:*');
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }

      // Clear article caches (this could be more specific in production)
      const articleKeys = await redisClient.keys('article:*');
      if (articleKeys.length > 0) {
        await redisClient.del(...articleKeys);
      }
    } catch (error) {
      logger.error('Clear article caches error:', error);
    }
  }
}