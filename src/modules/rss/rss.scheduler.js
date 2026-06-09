const cron = require('node-cron');
const logger = require('../../utils/logger');
const { env } = require('../../config/env');
const { RSS_SOURCES } = require('../../config/rss.sources');
const { fetchAllSources } = require('./rss.fetcher');
const { normalizeSource } = require('./rss.normalizer');
const { setNewsStore } = require('../news/news.service');
const { scrapeOG } = require('../../utils/og.scrapper');

let isRunning = false;
let schedulerJob = null;
let runningPromise = null;

const categoryFetchLocks = {};
const lastCategoryFetch = {};

// Helper to merge newly fetched articles with the existing store, preserving enriched content
const mergeArticles = (newArticles, existingArticles) => {
    const existingMap = new Map(existingArticles.map(a => [a.url, a]));

    const merged = newArticles.map(newArt => {
        const existing = existingMap.get(newArt.url);
        if (existing) {
            return {
                ...newArt,
                image: existing.image || newArt.image,
                description: existing.description || newArt.description,
                needsEnrich: existing.needsEnrich !== undefined ? existing.needsEnrich : newArt.needsEnrich,
            };
        }
        return newArt;
    });

    const newUrls = new Set(newArticles.map(a => a.url));
    const extra = existingArticles.filter(a => !newUrls.has(a.url));

    return deduplicate([...merged, ...extra]);
};

// enrich articles missing image or description incrementally in the background
const enrichArticlesIncremental = async (articles) => {
    const toEnrich = articles
        .filter((a) => a.needsEnrich)
        .slice(0, 100);

    if (toEnrich.length === 0) return;

    logger.info(`Enriching ${toEnrich.length} articles incrementally...`);

    const BATCH_SIZE = 8;
    for (let i = 0; i < toEnrich.length; i += BATCH_SIZE) {
        const batch = toEnrich.slice(i, i + BATCH_SIZE);
        const enrichedBatch = [];

        await Promise.allSettled(
            batch.map(async (article) => {
                if (!article.url) return;
                try {
                    const { image, description } = await scrapeOG(article.url);
                    const updated = { ...article };
                    if (image) updated.image = image;
                    if (description) updated.description = description;
                    if (updated.image && updated.description) {
                        updated.needsEnrich = false;
                    }
                    enrichedBatch.push(updated);
                } catch (err) {
                    // Ignore errors, we'll retry next time
                }
            })
        );

        // Update the newsStore with this batch's enriched articles immediately
        if (enrichedBatch.length > 0) {
            const currentStore = getNewsStore() || [];
            const enrichedMap = new Map(enrichedBatch.map(a => [a.url, a]));

            const updatedStore = currentStore.map(art => {
                const enriched = enrichedMap.get(art.url);
                if (enriched) {
                    return {
                        ...art,
                        image: enriched.image || art.image,
                        description: enriched.description || art.description,
                        needsEnrich: enriched.needsEnrich,
                    };
                }
                return art;
            });

            setNewsStore(updatedStore);
        }

        // small delay between batches — be polite to servers
        await new Promise((r) => setTimeout(r, 500));
    }

    logger.info('Incremental OG enrichment complete');
};

const runFetchCycle = async () => {
    if (isRunning) {
        logger.warn('RSS fetch already in progress, waiting for current cycle');
        return runningPromise;
    }

    isRunning = true;
    runningPromise = (async () => {
        const startTime = Date.now();
        logger.info('RSS fetch cycle started');

        try {
            const fetchedResults = await fetchAllSources(RSS_SOURCES);

            const allArticles = fetchedResults.flatMap(({ source, items }) =>
                normalizeSource(items, source)
            );

            // Save raw articles to the store immediately so they are cached
            const current = getNewsStore() || [];
            const merged = mergeArticles(allArticles, current);
            setNewsStore(merged);

            // Run enrichment in the background without blocking
            enrichArticlesIncremental(allArticles).catch((err) => {
                logger.error(`Background incremental enrichment failed: ${err.message}`);
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            logger.info(`RSS fetch cycle started background enrichment — ${allArticles.length} raw articles processed in ${duration}s`);

        } catch (err) {
            logger.error(`RSS fetch cycle failed: ${err.message}`);
        } finally {
            isRunning = false;
            runningPromise = null;
        }
    })();

    return runningPromise;
};

const startScheduler = () => {
    const intervalMin = parseInt(env.rssInterval) || 30;
    const clampedMin = Math.min(Math.max(intervalMin, 5), 60);
    const cronExpr = `*/${clampedMin} * * * *`;

    logger.info(`RSS scheduler starting — refresh every ${clampedMin} minutes`);

    runFetchCycle();

    schedulerJob = cron.schedule(cronExpr, runFetchCycle, {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    });

    logger.info('RSS scheduler running');
};

const stopScheduler = () => {
    if (schedulerJob) {
        schedulerJob.stop();
        logger.info('RSS scheduler stopped');
    }
};

const triggerManualRefresh = (force = false) => {
    if (force) {
        // clear the news store so stale articles don't persist
        const { setNewsStore } = require('../news/news.service');
        setNewsStore([]); // wipe before re-fetch
    }
    logger.info('Manual RSS refresh triggered');
    if (isRunning) {
        logger.warn('Manual refresh requested while refresh already in progress');
        return runningPromise;
    }

    runFetchCycle().catch((err) => {
        logger.error(`Background manual refresh failed: ${err.message}`);
    });
};

// ── Fetch category-specific sources once and merge into store ──────────────
const { getNewsStore } = require('../news/news.service');
const { deduplicate } = require('../../utils/deduplicate');

const DEFAULT_CATEGORY_SOURCE_CATEGORIES = [
    'general',
    'world',
    'technology',
    'business',
    'sports',
    'entertainment',
];

const CATEGORY_SOURCE_ALIASES = {
    general: ['general'],
    world: ['world'],

    india: ['india'],

    technology: ['technology'],
    ai: ['ai', 'technology'],

    science: ['science'],
    environment: ['environment', 'science'],

    business: ['business'],
    finance: ['business', 'crypto'],
    crypto: ['crypto'],

    sports: ['sports'],
    gaming: ['gaming', 'technology'],

    entertainment: ['entertainment'],

    movies: [
        'entertainment'
    ],

    music: [
        'entertainment'
    ],

    health: [
        'science'
    ],

    fitness: [
        'health'
    ],

    education: [
        'general',
        'science'
    ],

    travel: [
        'world'
    ],

    food: [
        'lifestyle'
    ],

    lifestyle: [
        'entertainment'
    ],

    fashion: [
        'lifestyle'
    ],

    automotive: [
        'technology',
        'business'
    ],

    space: [
        'science'
    ],

    politics: [
        'world',
        'general'
    ],
};

const getCategorySources = (category) => {
    const configured = RSS_SOURCES.filter((s) => s.category === category);
    if (configured.length > 0) return configured;

    const aliasCategories = CATEGORY_SOURCE_ALIASES[category] || DEFAULT_CATEGORY_SOURCE_CATEGORIES;
    const aliased = RSS_SOURCES
        .filter((source) => aliasCategories.includes(source.category))
        .map((source) => ({
            ...source,
            name: `${source.name} (${category})`,
            category,
        }));

    const byUrl = new Map(aliased.map((source) => [source.url, source]));
    return [...byUrl.values()];
};

const fetchCategoryOnce = async (category) => {
    logger.info(
        `Category one-shot fetch requested for: ${category}`
    );

    if (categoryFetchLocks[category]) {
        logger.info(`Category fetch for ${category} already in progress`);
        return [];
    }

    const now = Date.now();
    const lastFetch = lastCategoryFetch[category] || 0;
    // Cooldown of 5 minutes (300,000 ms)
    if (now - lastFetch < 5 * 60 * 1000) {
        logger.info(`Category fetch for ${category} skipped (cooldown active)`);
        return [];
    }

    categoryFetchLocks[category] = true;
    lastCategoryFetch[category] = now;

    const sources = getCategorySources(category);

    try {
        const fetchedResults = await fetchAllSources(sources);

        const allArticles = fetchedResults.flatMap(({ source, items }) =>
            normalizeSource(items, source)
        );

        // attach category ONLY to fetched articles
        const categorized = allArticles.map((article) => ({
            ...article,
            requestedCategory: category,
        }));

        const current = getNewsStore() || [];
        const merged = mergeArticles(categorized, current);

        setNewsStore(merged);

        // Run incremental enrichment in background without blocking the request
        enrichArticlesIncremental(categorized).catch((err) => {
            logger.error(`Background category incremental enrichment failed for ${category}: ${err.message}`);
        });

        logger.info(
            `Category fetch complete (enriching in background) — added ${categorized.length} raw articles for ${category}`
        );

        return categorized;

    } catch (err) {
        logger.error(
            `Category fetch failed for ${category}: ${err.message}`
        );

        return [];
    } finally {
        delete categoryFetchLocks[category];
    }
};

module.exports = { startScheduler, stopScheduler, triggerManualRefresh, fetchCategoryOnce, };
