require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { validateEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const { corsOptions } = require('./config/cors');
const { env } = require('./config/env');
const logger = require('./utils/logger');
const errorMiddleware = require('./middlewares/error.middleware');
const loggerMiddleware = require('./middlewares/logger.middleware');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');
const { startScheduler, stopScheduler } = require('./modules/rss/rss.scheduler');

// ── Validate env before anything else ────────────────────────────────────────
validateEnv();

const app = express();

// ── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Request logging ───────────────────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}
app.use(loggerMiddleware);

// ── Global rate limit ─────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/user.routes'));
app.use('/api/news', require('./modules/news/news.routes'));
app.use('/api/bookmarks', require('./modules/bookmarks/bookmark.routes'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

// ── Start server ──────────────────────────────────────────────────────────────
let server;

const start = async () => {
  await connectDB();

  server = app.listen(env.port, '0.0.0.0', () => {
    logger.info(`Server running in ${env.nodeEnv} mode on http://0.0.0.0:${env.port}`);
    startScheduler();
  });
};

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  stopScheduler();

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      } catch (err) {
        logger.error(`Error closing MongoDB: ${err.message}`);
      }

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Unhandled errors — log and exit ──────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

start();

module.exports = app;
