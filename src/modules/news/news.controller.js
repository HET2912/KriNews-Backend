const newsService = require('./news.service');
const { sendSuccess, sendError } = require('../../utils/response');
const logger = require('../../utils/logger');

const getAllNews = async (req, res, next) => {
    try {
        const result = await newsService.getAllNews({ query: req.query });
        return res.status(200).json({
            success: true,
            message: 'News fetched successfully',
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

const getFeed = async (req, res, next) => {
    const start = Date.now();
    try {
        const User = require('../users/user.model');
        const user = await User.findById(req.user.id).lean();
        const preferences = user?.preferences?.categories || [];
        const result = await newsService.getPersonalizedFeed(
            req.user.id, preferences, req.query
        );
        logger.debug(`Feed response ready in ${Date.now() - start}ms`);
        return res.status(200).json({
            success: true,
            message: 'Feed fetched',
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

const getNewsBySlug = async (req, res, next) => {
    try {
        const article = await newsService.getNewsBySlug(req.params.slug);
        return sendSuccess(res, { article }, 'Article fetched');
    } catch (err) {
        next(err);
    }
};

const getNewsByCategory = async (req, res, next) => {
    try {
        const result = await newsService.getNewsByCategory(
            req.params.category, req.query
        );
        return res.status(200).json({
            success: true,
            message: `News fetched for category: ${req.params.category}`,
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

const searchNews = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return sendError(res, 'Search query "q" is required', 400);
        const result = await newsService.searchNews(q, req.query);
        return res.status(200).json({
            success: true,
            message: `Search results for: ${q}`,
            query: q,
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

const getSources = (req, res, next) => {
    try {
        const sources = newsService.getSources();
        return sendSuccess(res, { sources }, 'Sources fetched');
    } catch (err) {
        next(err);
    }
};

const getStats = (req, res, next) => {
    try {
        const stats = newsService.getStats();
        return sendSuccess(res, { stats }, 'Stats fetched');
    } catch (err) {
        next(err);
    }
};

const getEnrichmentStatus = (req, res, next) => {
    try {
        const status = newsService.getEnrichmentStatus();
        return res.status(200).json({ success: true, ...status });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllNews,
    getFeed,
    getNewsBySlug,
    getNewsByCategory,
    searchNews,
    getSources,
    getStats,
    getEnrichmentStatus,
};
