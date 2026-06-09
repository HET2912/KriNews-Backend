const mongoose = require('mongoose');
const Bookmark = require('./bookmark.model');

const {
    addBookmarkValidator,
    updateBookmarkTypeValidator,
    VALID_TYPES,
} = require('./bookmark.validator');

// ── Add bookmark ──────────────────────────────────────────────────────────────
const addBookmark = async (userId, data) => {
    const errors = addBookmarkValidator(data);
    if (errors.length > 0) {
        const err = new Error(errors.join('. '));
        err.statusCode = 422;
        throw err;
    }

    const {
        articleUrl,
        articleSlug,
        title,
        description,
        image,
        source,
        category,
        publishedAt,
        type,
    } = data;

    // check if already bookmarked with same type
    const existing = await Bookmark.findOne({ user: userId, articleUrl, type });
    if (existing) {
        const err = new Error(`Article already in your ${type === 'liked' ? 'likes' : 'read later'} list`);
        err.statusCode = 409;
        throw err;
    }

    const bookmark = await Bookmark.create({
        user: userId,
        articleUrl,
        articleSlug,
        title,
        description,
        image,
        source,
        category,
        publishedAt,
        type,
    });

    return bookmark;
};

// ── Remove bookmark ───────────────────────────────────────────────────────────
const removeBookmark = async (userId, bookmarkId) => {
    const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: userId });

    if (!bookmark) {
        const err = new Error('Bookmark not found');
        err.statusCode = 404;
        throw err;
    }

    await bookmark.deleteOne();
    return { message: 'Bookmark removed successfully' };
};

// ── Remove bookmark by articleUrl + type ─────────────────────────────────────
// useful from frontend where you have the article but not bookmark _id
const removeBookmarkByArticle = async (userId, articleUrl, type) => {
    if (!VALID_TYPES.includes(type)) {
        const err = new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`);
        err.statusCode = 422;
        throw err;
    }

    const bookmark = await Bookmark.findOneAndDelete({ user: userId, articleUrl, type });

    if (!bookmark) {
        const err = new Error('Bookmark not found');
        err.statusCode = 404;
        throw err;
    }

    return { message: 'Bookmark removed successfully' };
};

// ── Switch type — liked ↔ read_later ─────────────────────────────────────────
const switchBookmarkType = async (userId, bookmarkId, newType) => {
    const errors = updateBookmarkTypeValidator({ type: newType });
    if (errors.length > 0) {
        const err = new Error(errors.join('. '));
        err.statusCode = 422;
        throw err;
    }

    const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: userId });
    if (!bookmark) {
        const err = new Error('Bookmark not found');
        err.statusCode = 404;
        throw err;
    }

    if (bookmark.type === newType) {
        const err = new Error(`Bookmark is already of type: ${newType}`);
        err.statusCode = 400;
        throw err;
    }

    // check if the same article already exists with the new type
    const conflict = await Bookmark.findOne({
        user: userId,
        articleUrl: bookmark.articleUrl,
        type: newType,
    });
    if (conflict) {
        const err = new Error(`Article already exists in your ${newType === 'liked' ? 'likes' : 'read later'} list`);
        err.statusCode = 409;
        throw err;
    }

    bookmark.type = newType;
    await bookmark.save();
    return bookmark;
};

// ── Get all bookmarks for a user ──────────────────────────────────────────────
const getAllBookmarks = async (userId, query = {}) => {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const filter = { user: userId };
    if (query.type && VALID_TYPES.includes(query.type)) {
        filter.type = query.type;
    }
    if (query.category) {
        filter.category = query.category;
    }

    const [bookmarks, total] = await Promise.all([
        Bookmark.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Bookmark.countDocuments(filter),
    ]);

    return {
        data: bookmarks,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ── Get liked bookmarks ───────────────────────────────────────────────────────
const getLiked = async (userId, query = {}) => {
    return getAllBookmarks(userId, { ...query, type: 'liked' });
};

// ── Get read later bookmarks ──────────────────────────────────────────────────
const getReadLater = async (userId, query = {}) => {
    return getAllBookmarks(userId, { ...query, type: 'read_later' });
};

// ── Check if article is bookmarked ────────────────────────────────────────────
const checkBookmarkStatus = async (userId, articleUrl) => {
    const bookmarks = await Bookmark.find({ user: userId, articleUrl }).lean();

    const status = {
        liked: false,
        read_later: false,
        likedId: null,
        readLaterId: null,
    };

    bookmarks.forEach((b) => {
        if (b.type === 'liked') {
            status.liked = true;
            status.likedId = b._id;
        }
        if (b.type === 'read_later') {
            status.read_later = true;
            status.readLaterId = b._id;
        }
    });

    return status;
};

// ── Get bookmark counts for a user ────────────────────────────────────────────
const getBookmarkCounts = async (userId) => {
    const counts = await Bookmark.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const result = { liked: 0, read_later: 0, total: 0 };
    counts.forEach(({ _id, count }) => {
        result[_id] = count;
        result.total += count;
    });

    return result;
};

// ── Clear all bookmarks of a type ─────────────────────────────────────────────
const clearBookmarks = async (userId, type) => {
    if (!VALID_TYPES.includes(type)) {
        const err = new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`);
        err.statusCode = 422;
        throw err;
    }

    const result = await Bookmark.deleteMany({ user: userId, type });
    return {
        message: `Cleared all ${type === 'liked' ? 'liked' : 'read later'} bookmarks`,
        deleted: result.deletedCount,
    };
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