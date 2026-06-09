const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { env } = require('./env');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });

        logger.info(`MongoDB connected: ${conn.connection.host}`);

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected.');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err.message}`);
        });

    } catch (err) {
        logger.error(`MongoDB initial connection failed: ${err.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB };