import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './app';
import { ENV } from './config/env';
import { logger } from './config/logger';
import { notificationSchedulerJob } from './jobs/notificationScheduler';

async function start() {
  // Start background workers
  notificationSchedulerJob.start();

  if (ENV.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(expressStaticMiddleware(distPath));
  }

  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    logger.info(`URBN Services Production Server running at http://0.0.0.0:${ENV.PORT} [${ENV.NODE_ENV}]`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    logger.info('Received shutdown signal, terminating server gracefully...');
    notificationSchedulerJob.stop();
    server.close(() => {
      logger.info('Server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

function expressStaticMiddleware(distPath: string) {
  const express = require('express');
  const router = express.Router();
  router.use(express.static(distPath));
  router.get('*', (req: any, res: any) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  return router;
}

start().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
