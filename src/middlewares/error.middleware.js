const logger = require('../utils/logger');
const { env } = require('../config/env');

const errorMiddleware = (err, req, res, next) => {
    // default to 500 if no status was set
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';

    // ── Mongoose: document not found ─────────────────────────────────────────
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // ── Mongoose: duplicate key ───────────────────────────────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {}).join(', ');
        statusCode = 409;
        message = `Duplicate value for field: ${field}`;
    }

    // ── Mongoose: validation error ────────────────────────────────────────────
    if (err.name === 'ValidationError') {
        statusCode = 422;
        const errors = Object.values(err.errors).map((e) => e.message);
        message = errors.join('. ');
    }

    // ── CORS error ────────────────────────────────────────────────────────────
    if (err.message && err.message.startsWith('CORS:')) {
        statusCode = 403;
        message = err.message;
    }

    // ── JWT errors (fallback if they ever reach here) ─────────────────────────
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Session expired. Please log in again.';
    }
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token.';
    }

    // ── Log the error ─────────────────────────────────────────────────────────
    if (statusCode >= 500) {
        logger.error(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${message}`, {
            stack: err.stack,
        });
    } else {
        logger.warn(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${message}`);
    }

    // ── Send response ─────────────────────────────────────────────────────────
    const response = {
        success: false,
        message,
    };

    // only expose stack trace in development
    if (env.nodeEnv === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorMiddleware;