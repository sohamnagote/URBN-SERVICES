import express, { Express } from 'express';
import apiRouter from './routes/index';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(requestLogger);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'URBN Services Backend',
      cluster: 'nashik-central-01',
      timestamp: new Date().toISOString(),
    });
  });

  // Master API router mounted at /api
  app.use('/api', apiRouter);

  // Global Centralized Error Handling
  app.use(errorHandler);

  return app;
}

export const app = createApp();
