/**
 * Deduplicate an array of news items.
 * Primary strategy: exact URL match.
 * Secondary strategy: fuzzy title match (normalized).
 */

const normalizeTitle = (title) => {
    if (!title || typeof title !== 'string') return '';
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')   // strip punctuation
        .replace(/\s+/g, ' ');
};

const deduplicateByUrl = (items) => {
    const seen = new Set();
    return items.filter((item) => {
        if (!item.url || seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
    });
};

const deduplicateByTitle = (items) => {
    const seen = new Set();
    return items.filter((item) => {
        const normalized = normalizeTitle(item.title);
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });
};

// Make sure it keeps the NEWER article, not the first seen
const deduplicate = (articles) => {
    const seen = new Map();
    for (const article of articles) {
        if (!article.url) continue;
        // if already seen, keep whichever has newer publishedAt
        if (seen.has(article.url)) {
            const existing = seen.get(article.url);
            if (new Date(article.publishedAt) > new Date(existing.publishedAt)) {
                seen.set(article.url, article);
            }
        } else {
            seen.set(article.url, article);
        }
    }
    return Array.from(seen.values());
};

module.exports = { deduplicate, deduplicateByUrl, deduplicateByTitle };