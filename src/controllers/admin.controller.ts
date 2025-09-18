import { Request, Response } from 'express';
import { ArticleService } from '../services/article.service';
import { SourceService } from '../services/source.service';
import { CategoryService } from '../services/category.service';
import { ScrapingService, ScrapedArticle } from '../services/scraping.service';

import {
  createArticleSchema,
  updateArticleSchema,
  createSourceSchema,
  updateSourceSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../utils/validation';
import { logger } from '../utils/logger';

export class AdminController {
  private scrapingService: ScrapingService;
  private articleService: ArticleService;
  private sourceService: SourceService;
  private categoryService: CategoryService;

  constructor() {
    this.articleService = new ArticleService();
    this.sourceService = new SourceService();
    this.categoryService = new CategoryService();
    this.scrapingService = new ScrapingService();
  }

  // Article management
  createArticle = async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedData = createArticleSchema.parse(req.body);

      const article = await this.articleService.createArticle({
        ...validatedData,
        images: validatedData.images ?? [], // handle images
      });

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: article,
      });
    } catch (error) {
      logger.error('Create article controller error:', error);

      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create article',
      });
    }
  };

  getArticles = async (req: Request, res: Response) => {
  try {
    const filters: any = {};

    if (req.query.published !== undefined) {
      filters.published = req.query.published === 'true';
    }

    if (req.query.categoryId) {
      filters.categoryId = req.query.categoryId;
    }

    if (req.query.sourceId) {
      filters.sourceId = req.query.sourceId;
    }

    const articles = await this.articleService.getArticles(filters);

    res.json({
      success: true,
      data: articles,
    });
  } catch (error) {
    logger.error('Get articles controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch articles',
    });
  }
};


  updateArticle = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Validate input
      const validatedData = updateArticleSchema.parse(req.body);

      const article = await this.articleService.updateArticle(id, {
        ...validatedData,
        images: validatedData.images ?? [], // handle images
      });

      res.json({
        success: true,
        message: 'Article updated successfully',
        data: article,
      });
    } catch (error) {
      logger.error('Update article controller error:', error);

      if (error instanceof Error) {
        if (error.message === 'Article not found') {
          return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: error.message,
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update article',
      });
    }
  };

  publishArticle = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const article = await this.articleService.publishArticle(id);

      res.json({
        success: true,
        message: 'Article published successfully',
        data: article,
      });
    } catch (error) {
      logger.error('Publish article controller error:', error);

      if (error instanceof Error) {
        if (error.message === 'Article not found') {
          return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to publish article',
      });
    }
  };

  // Source management
  createSource = async (req: Request, res: Response) => {
    try {
      const validatedData = createSourceSchema.parse(req.body);

      const source = await this.sourceService.createSource(validatedData);

      res.status(201).json({
        success: true,
        message: 'Source created successfully',
        data: source,
      });
    } catch (error) {
      logger.error('Create source controller error:', error);

      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create source',
      });
    }
  };

  updateSource = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateSourceSchema.parse(req.body);

      const source = await this.sourceService.updateSource(id, validatedData);

      res.json({
        success: true,
        message: 'Source updated successfully',
        data: source,
      });
    } catch (error) {
      logger.error('Update source controller error:', error);

      if (error instanceof Error) {
        if (error.message === 'Source not found') {
          return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: error.message,
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update source',
      });
    }
  };

  getSources = async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.active !== undefined) {
        filters.active = req.query.active === 'true';
      }

      const sources = await this.sourceService.getSources(filters);

      res.json({
        success: true,
        data: sources,
      });
    } catch (error) {
      logger.error('Get sources controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to get sources',
      });
    }
  };

  // Category management
  createCategory = async (req: Request, res: Response) => {
    try {
      const validatedData = createCategorySchema.parse(req.body);

      const category = await this.categoryService.createCategory(validatedData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      logger.error('Create category controller error:', error);

      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create category',
      });
    }
  };

  updateCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateCategorySchema.parse(req.body);

      const category = await this.categoryService.updateCategory(id, validatedData);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      logger.error('Update category controller error:', error);

      if (error instanceof Error) {
        if (error.message === 'Category not found') {
          return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: error.message,
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update category',
      });
    }
  };

    // Ingest management
  // inside AdminController
async triggerScrape(req: any, res: any) {
    try {
      const result = await this.scrapingService.scrapeAllSources();
      return res.json({ success: true, count: result.length });
    } catch (err) {
      console.error("triggerScrape failed", err);
      return res.status(500).json({ success: false, error: "Scrape failed" });
    }
  }
}