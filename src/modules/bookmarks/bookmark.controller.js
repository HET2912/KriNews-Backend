const bookmarkService = require('./bookmark.service');
const { sendSuccess, sendError } = require('../../utils/response');

const addBookmark = async (req, res, next) => {
    try {
        const bookmark = await bookmarkService.addBookmark(req.user.id, req.body);
        return sendSuccess(res, { bookmark }, 'Bookmark added successfully', 201);
    } catch (err) {
        next(err);
    }
};

const removeBookmark = async (req, res, next) => {
    try {
        const result = await bookmarkService.removeBookmark(req.user.id, req.params.id);
        return sendSuccess(res, null, result.message);
    } catch (err) {
        next(err);
    }
};

const removeBookmarkByArticle = async (req, res, next) => {
    try {
        const { articleUrl, type } = req.body;
        if (!articleUrl || !type) {
            return sendError(res, 'articleUrl and type are required', 422);
        }
        const result = await bookmarkService.removeBookmarkByArticle(req.user.id, articleUrl, type);
        return sendSuccess(res, null, result.message);
    } catch (err) {
        next(err);
    }
};

const switchBookmarkType = async (req, res, next) => {
    try {
        const { type } = req.body;
        const bookmark = await bookmarkService.switchBookmarkType(req.user.id, req.params.id, type);
        return sendSuccess(res, { bookmark }, 'Bookmark type updated');
    } catch (err) {
        next(err);
    }
};

const getAllBookmarks = async (req, res, next) => {
    try {
        const result = await bookmarkService.getAllBookmarks(req.user.id, req.query);
        return res.status(200).json({
            success: true,
            message: 'Bookmarks fetched',
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

const getLiked = async (req, res, next) => {
    try {
        const result = await bookmarkService.getLiked(req.user.id, req.query);
        return res.status(200).json({
            success: true,
            message: 'Liked articles fetched',
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

const getReadLater = async (req, res, next) => {
    try {
        const result = await bookmarkService.getReadLater(req.user.id, req.query);
        return res.status(200).json({
            success: true,
            message: 'Read later articles fetched',
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

const checkBookmarkStatus = async (req, res, next) => {
    try {
        const { articleUrl } = req.query;
        if (!articleUrl) {
            return sendError(res, 'articleUrl query param is required', 422);
        }
        const status = await bookmarkService.checkBookmarkStatus(req.user.id, articleUrl);
        return sendSuccess(res, { status }, 'Bookmark status fetched');
    } catch (err) {
        next(err);
    }
};

const getBookmarkCounts = async (req, res, next) => {
    try {
        const counts = await bookmarkService.getBookmarkCounts(req.user.id);
        return sendSuccess(res, { counts }, 'Bookmark counts fetched');
    } catch (err) {
        next(err);
    }
};

const clearBookmarks = async (req, res, next) => {
    try {
        const { type } = req.params;
        const result = await bookmarkService.clearBookmarks(req.user.id, type);
        return sendSuccess(res, { deleted: result.deleted }, result.message);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    addBookmark,
    removeBookmark,
    removeBookmarkByArticle,
    switchBookmarkType,
    getAllBookmarks,
    getLiked,
    getReadLater,
    checkBookmarkStatus,
    getBookmarkCounts,
    clearBookmarks,
};