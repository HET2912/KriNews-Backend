const CATEGORIES = [
    'general',
    'world',
    'india',

    'technology',
    'ai',
    'science',
    'environment',

    'business',
    'finance',
    'crypto',

    'sports',
    'gaming',

    'entertainment',
    'movies',
    'music',

    'health',
    'fitness',

    'education',
    'travel',
    'food',

    'lifestyle',
    'fashion',

    'automotive',
    'space',

    'politics',
];

const LANGUAGES = [
    'en',
    'hi',
    'gu',
];

const SORT_OPTIONS = {
    LATEST: 'latest',
    OLDEST: 'oldest',
    RELEVANT: 'relevant',
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 3000;

const CACHE_KEYS = {
    ALL_NEWS: 'news:all',

    BY_CATEGORY: (cat) =>
        `news:category:${cat}`,

    BY_SOURCE: (src) =>
        `news:source:${src}`,

    SEARCH: (q) =>
        `news:search:${q}`,

    SINGLE: (slug) =>
        `news:single:${slug}`,
};

const CACHE_TTL = {
    NEWS_LIST: 300,
    SINGLE_NEWS: 600,
    SEARCH: 120,
};

module.exports = {
    CATEGORIES,
    LANGUAGES,
    SORT_OPTIONS,
    DEFAULT_PAGE,
    DEFAULT_LIMIT,
    MAX_LIMIT,
    CACHE_KEYS,
    CACHE_TTL,
};