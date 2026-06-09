const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // we don't store full article in DB — just enough to identify and display it
        articleUrl: {
            type: String,
            required: [true, 'Article URL is required'],
            trim: true,
        },
        articleSlug: {
            type: String,
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Article title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: null,
        },
        image: {
            type: String,
            default: null,
        },
        source: {
            type: String,
            default: null,
        },
        category: {
            type: String,
            default: null,
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        type: {
            type: String,
            enum: ['liked', 'read_later'],
            required: [true, 'Bookmark type is required'],
        },
    },
    {
        timestamps: true,
    }
);

// ── Compound index — one bookmark per user per article per type ───────────────
bookmarkSchema.index({ user: 1, articleUrl: 1, type: 1 }, { unique: true });

// ── Index for fast user queries ───────────────────────────────────────────────
bookmarkSchema.index({ user: 1, type: 1, createdAt: -1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;