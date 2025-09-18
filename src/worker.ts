import { createWorkers, scheduleScrapingJob } from './config/bullmq';
import { logger } from './utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function startWorker() {
  try {
    logger.info('Starting NewsHub worker...');

    // Create and start workers
    const workers = createWorkers();
    logger.info('Workers created successfully');

    // Schedule the recurring scraping job
    await scheduleScrapingJob();
    logger.info('Scraping job scheduled to run every 5 minutes');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down worker gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down worker gracefully');
      process.exit(0);
    });

    logger.info('Worker started successfully');
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

// Start the worker
startWorker();