const cache = require('../../utils/cache');
const { deduplicate } = require('../../utils/deduplicate');
const { scrapeOG } = require('../../utils/og.scrapper');
const logger = require('../../utils/logger');

const {
    CACHE_KEYS,
    CACHE_TTL,
} = require('./news.constants');

const {
    parsePagination,
    parseSort,
    buildSearchRegex,
} = require('./news.utils');

let newsStore = [];

const setNewsStore = (articles) => {
    newsStore = deduplicate(articles);
    cache.flush();
    logger.info(`News store updated: ${newsStore.length} articles`);
};

const getNewsStore = () => newsStore;

const capByCategory = (articles, maxPerCategory = 500) => {
    const counts = {};
    return articles.filter((a) => {
        const key = a.category || '__uncategorized__';
        counts[key] = (counts[key] || 0) + 1;
        return counts[key] <= maxPerCategory;
    });
};

// ── Category alias map ────────────────────────────────────────────────────────
const CATEGORY_ALIASES = {
    general: ['general'],
    technology: ['technology'],
    sports: ['sports'],
    india: ['india'],
    business: ['business'],
    entertainment: ['entertainment'],
    science: ['technology', 'general'],
    health: ['general', 'india'],
    breakingnews: ['general', 'india', 'sports'],
    trending: ['general', 'technology', 'sports', 'business', 'entertainment'],
    politics: ['general', 'india'],
    world: ['world', 'general'],
    environment: ['general', 'technology'],
    education: ['general', 'india'],
    weather: ['general', 'india'],
    climate: ['general', 'technology'],
    humanrights: ['general', 'india'],
    immigration: ['general'],
    law: ['general', 'india', 'business'],
    crime: ['general', 'india'],
    crypto: ['business', 'technology'],
    finance: ['business'],
    realestate: ['business', 'general'],
    startups: ['technology', 'business'],
    stockmarket: ['business'],
    economy: ['business', 'general'],
    banking: ['business'],
    investing: ['business'],
    personalfinance: ['business'],
    insurance: ['business'],
    gaming: ['technology', 'entertainment'],
    food: ['entertainment', 'general'],
    travel: ['general', 'entertainment'],
    fashion: ['entertainment', 'general'],
    fitness: ['general', 'technology'],
    beauty: ['entertainment', 'general'],
    relationships: ['general', 'entertainment'],
    parenting: ['general'],
    pets: ['general'],
    diy: ['general', 'technology'],
    music: ['entertainment'],
    movies: ['entertainment'],
    art: ['entertainment', 'general'],
    books: ['entertainment', 'general'],
    photography: ['entertainment', 'technology'],
    tvshows: ['entertainment'],
    anime: ['entertainment'],
    comics: ['entertainment'],
    history: ['general'],
    theatre: ['entertainment'],
    space: ['technology', 'general'],
    ai: ['technology'],
    cybersecurity: ['technology'],
    automotive: ['technology', 'business'],
    robotics: ['technology'],
    gadgets: ['technology'],
    programming: ['technology'],
    opensource: ['technology'],
    cloud: ['technology'],
    datascience: ['technology'],
    football: ['sports'],
    cricket: ['sports', 'india'],
    basketball: ['sports'],
    tennis: ['sports'],
    formula1: ['sports'],
    esports: ['sports', 'technology'],
    olympics: ['sports'],
    badminton: ['sports', 'india'],
    podcasts: ['entertainment', 'technology'],
    journalism: ['general'],
    socialmedia: ['technology', 'entertainment'],
    streaming: ['entertainment', 'technology'],
    contentcreators: ['entertainment'],
    jobs: ['business', 'technology'],
    careeradvice: ['business'],
    interviews: ['business', 'entertainment'],
    freelancing: ['business', 'technology'],
    remotejobs: ['business', 'technology'],
    electricvehicles: ['technology', 'business'],
    motorcycles: ['technology'],
    carreviews: ['technology'],
    carnews: ['technology', 'business'],
    shopping: ['business', 'technology'],
    deals: ['business'],
    luxury: ['business', 'entertainment'],
    smartphones: ['technology'],
    wearables: ['technology'],
    mentalhealth: ['general'],
    meditation: ['general'],
    nutrition: ['general'],
    yoga: ['general'],
    selfcare: ['general'],
    memes: ['entertainment', 'technology'],
    funfacts: ['general', 'technology'],
    quizzes: ['entertainment', 'general'],
    quotes: ['general', 'entertainment'],
    motivation: ['general', 'business'],
};

const resolveCategories = (category) => {
    if (!category) return null;
    const lower = category.toLowerCase().trim();
    return CATEGORY_ALIASES[lower] || [lower];
};

// ── enrichment score ──────────────────────────────────────────────────────────
// 0 = nothing, 1 = description only, 2 = image only, 3 = both
// Used to sort enriched articles to the front of the page slice.
const enrichScore = (a) => (a.image ? 2 : 0) + (a.description ? 1 : 0);

// ── isUsable ──────────────────────────────────────────────────────────────────
const isUsable = (a) => {
    if (!a.url || !a.title) return false;
    return a.title.trim().split(/\s+/).filter(Boolean).length >= 4;
};

// ── enrichArticle (single) ────────────────────────────────────────────────────
const enrichArticle = async (article) => {
    if (!article.needsEnrich || !article.url) return article;

    const cacheKey = `enrich:${article.url}`;
    const cached = cache.get(cacheKey);
    if (cached) {
        if (cached.image && !article.image) article.image = cached.image;
        if (cached.description && !article.description) article.description = cached.description;
        if (article.image && article.description) article.needsEnrich = false;
        return article;
    }

    try {
        const { image, description } = await scrapeOG(article.url);
        if (image) article.image = image;
        if (description) article.description = description;
        if (article.image && article.description) {
            article.needsEnrich = false;
            cache.set(cacheKey, { image: article.image, description: article.description }, 24 * 60 * 60);
        }
    } catch {
        // leave needsEnrich true for the background scheduler to retry
    }
    return article;
};

// ── enrichSlice ───────────────────────────────────────────────────────────────
// Best-effort enrich all articles in the page slice that still need it.
// Hard timeout of 3 s so we never hold the response hostage.
// Articles that finish within the window get their image/description in the
// response; the rest are returned as-is (frontend shows placeholder).
const ENRICH_TIMEOUT_MS = 3000;

const enrichSlice = async (articles) => {
    const needsEnrich = articles.filter((a) => a.needsEnrich && a.url);
    if (needsEnrich.length === 0) return articles;

    logger.info(`[enrichSlice] enriching ${needsEnrich.length} articles (timeout ${ENRICH_TIMEOUT_MS}ms)`);

    const timeout = new Promise((resolve) => setTimeout(resolve, ENRICH_TIMEOUT_MS));
    const work = Promise.allSettled(needsEnrich.map((a) => enrichArticle(a)));
    await Promise.race([work, timeout]);

    const enriched = needsEnrich.filter((a) => a.image || a.description).length;
    logger.info(`[enrichSlice] finished: ${enriched}/${needsEnrich.length} got image/description`);

    return articles;
};

// ── filterByCategory ──────────────────────────────────────────────────────────
const filterByCategory = (articles, category) => {
    if (!category) return articles;
    const resolvedCategories = resolveCategories(category);
    const lowerCategory = category.toLowerCase().trim();
    return articles.filter((a) =>
        resolvedCategories.includes(a.category) ||
        (a.requestedCategory && a.requestedCategory.toLowerCase() === lowerCategory)
    );
};

// ── interleave ────────────────────────────────────────────────────────────────
const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const interleaveByCategoryImproved = (articles) => {
    if (!Array.isArray(articles) || articles.length === 0) return articles;
    const buckets = new Map();
    for (const a of articles) {
        const key = a.category || '__uncategorized__';
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(a);
    }
    const keys = shuffle(Array.from(buckets.keys()));
    const result = [];
    let added = true;
    while (added) {
        added = false;
        for (const key of keys) {
            const bucket = buckets.get(key);
            if (bucket?.length > 0) { result.push(bucket.shift()); added = true; }
        }
    }
    return result;
};

// ── sortArticles ──────────────────────────────────────────────────────────────
const sortArticles = (articles, sortQuery) => {
    const sort = parseSort(sortQuery);
    const sortKey = Object.keys(sort)[0];
    const sortDir = sort[sortKey];
    return [...articles].sort((a, b) => {
        const aVal = a[sortKey], bVal = b[sortKey];
        if (aVal < bVal) return sortDir === 1 ? -1 : 1;
        if (aVal > bVal) return sortDir === 1 ? 1 : -1;
        return new Date(b.fetchedAt) - new Date(a.fetchedAt);
    });
};

// ── sortEnrichedFirst ─────────────────────────────────────────────────────────
// Within each interleaved position, prefer articles that already have
// image + description. This ensures page 1 is almost entirely enriched
// while unenriched articles naturally flow to later pages as enrichment catches up.
const sortEnrichedFirst = (articles) =>
    [...articles].sort((a, b) => enrichScore(b) - enrichScore(a));

// ── getAllNews ────────────────────────────────────────────────────────────────
const getAllNews = async ({ query = {} } = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const searchRegex = buildSearchRegex(query.search);
    const source = query.source?.trim() || null;

    let articles = [...newsStore];
    logger.info(`[getAllNews] step=start total=${articles.length} page=${page} limit=${limit}`);

    if (query.category) {
        articles = filterByCategory(articles, query.category);
        logger.info(`[getAllNews] step=after-category-filter total=${articles.length} category=${query.category}`);
    }
    if (source) articles = articles.filter((a) =>
        a.source?.toLowerCase().includes(source.toLowerCase())
    );
    if (searchRegex) articles = articles.filter(
        (a) => searchRegex.test(a.title) || searchRegex.test(a.description)
    );

    articles = sortArticles(articles, query.sort);

    if (!query.category) {
        articles = capByCategory(articles, 500);
        logger.info(`[getAllNews] step=after-cap total=${articles.length}`);
    }

    articles = interleaveByCategoryImproved(articles);

    const usable = articles.filter(isUsable);
    logger.info(`[getAllNews] step=after-quality-filter usable=${usable.length} (dropped ${articles.length - usable.length})`);

    // Sort enriched articles to the front so page 1 is the best-enriched slice
    const sorted = sortEnrichedFirst(usable);

    const total = sorted.length;
    const paged = sorted.slice(skip, skip + limit);

    // Best-effort enrich the page slice inline (3 s timeout)
    // Articles that finish enriching in time get served with image/description.
    // The rest are served as-is; the frontend shows a placeholder.
    await enrichSlice(paged);

    const withImage = paged.filter((a) => a.image).length;
    const withDesc = paged.filter((a) => a.description).length;

    const categoryCounts = {};
    paged.forEach((a) => { categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1; });
    logger.info(
        `[getAllNews] step=response page=${page} returning=${paged.length} ` +
        `withImage=${withImage} withDesc=${withDesc}`,
        categoryCounts
    );

    return {
        data: paged,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};

// ── getPersonalizedFeed ───────────────────────────────────────────────────────
const getPersonalizedFeed = async (userId, userPreferences = [], query = {}) => {
    const { page, limit, skip } = parsePagination(query);

    let feed;
    if (userPreferences.length === 0) {
        feed = [...newsStore];
    } else {
        const preferredUrls = new Set();
        const preferred = [], others = [];
        newsStore.forEach((a) => {
            const matches = userPreferences.some((pref) =>
                resolveCategories(pref).includes(a.category)
            );
            if (matches) {
                if (!preferredUrls.has(a.url)) { preferredUrls.add(a.url); preferred.push(a); }
            } else {
                others.push(a);
            }
        });
        feed = [...preferred, ...shuffle(others)];
    }

    if (feed.length === 0) {
        return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    feed = interleaveByCategoryImproved(feed);
    const usable = sortEnrichedFirst(feed.filter(isUsable));

    logger.info(`[getPersonalizedFeed] store=${newsStore.length} usable=${usable.length} page=${page} limit=${limit}`);

    const wrappedSkip = usable.length > 0 ? skip % usable.length : 0;
    const firstChunk = usable.slice(wrappedSkip, wrappedSkip + limit);
    const paged = firstChunk.length === limit
        ? firstChunk
        : [...firstChunk, ...usable.slice(0, limit - firstChunk.length)];

    await enrichSlice(paged);

    return {
        data: paged,
        pagination: {
            total: usable.length,
            page,
            limit,
            totalPages: Math.ceil(usable.length / limit),
            isLooping: wrappedSkip + limit > usable.length,
        },
    };
};

// ── getNewsBySlug ─────────────────────────────────────────────────────────────
const getNewsBySlug = async (slug) => {
    const article = newsStore.find((a) => a.slug === slug);
    if (!article) { const err = new Error('Article not found'); err.statusCode = 404; throw err; }
    await enrichArticle(article);
    return article;
};

// ── getNewsByCategory ─────────────────────────────────────────────────────────
const getNewsByCategory = async (category, query = {}) => {
    const { page } = query;
    if (!page || parseInt(page) === 1) {
        const { fetchCategoryOnce } = require('../rss/rss.scheduler');
        fetchCategoryOnce(category).catch((err) =>
            logger.error(`Background category fetch failed for ${category}: ${err.message}`)
        );
    }
    return getAllNews({ query: { ...query, category } });
};

// ── searchNews ────────────────────────────────────────────────────────────────
const searchNews = async (searchQuery, query = {}) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
        const err = new Error('Search query must be at least 2 characters');
        err.statusCode = 400;
        throw err;
    }
    return getAllNews({ query: { ...query, search: searchQuery } });
};

const getSources = () =>
    [...new Set(newsStore.map((a) => a.source).filter(Boolean))].sort();

const getStats = () => {
    const total = newsStore.length;
    const byCategory = {}, bySource = {};
    const enrichmentStats = { withImage: 0, withDescription: 0, withBoth: 0, withNeither: 0 };
    newsStore.forEach((a) => {
        if (a.category) byCategory[a.category] = (byCategory[a.category] || 0) + 1;
        if (a.source) bySource[a.source] = (bySource[a.source] || 0) + 1;
        const hi = !!a.image, hd = !!a.description;
        if (hi && hd) enrichmentStats.withBoth++;
        else if (hi) enrichmentStats.withImage++;
        else if (hd) enrichmentStats.withDescription++;
        else enrichmentStats.withNeither++;
    });
    return { total, byCategory, bySource, enrichmentStats, lastUpdated: newsStore[0]?.fetchedAt || null };
};

module.exports = {
    setNewsStore,
    getNewsStore,
    getAllNews,
    getPersonalizedFeed,
    getNewsBySlug,
    getNewsByCategory,
    searchNews,
    getSources,
    getStats,
    getEnrichmentStatus: () => {
        const total = newsStore.length;
        const needing = newsStore.filter((a) => a.needsEnrich).length;
        const perCategory = {};
        newsStore.forEach((a) => {
            const c = a.category || 'uncategorized';
            perCategory[c] = (perCategory[c] || 0) + 1;
        });
        return { total, needing, perCategory };
    },
};