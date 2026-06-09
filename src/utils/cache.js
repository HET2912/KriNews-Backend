const NodeCache = require('node-cache');

// TTL in seconds — default 10 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const get = (key) => {
    return cache.get(key) ?? null;
};

const set = (key, value, ttl) => {
    if (ttl !== undefined) {
        return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
};

const del = (key) => {
    return cache.del(key);
};

const flush = () => {
    cache.flushAll();
};

const has = (key) => {
    return cache.has(key);
};

module.exports = { get, set, del, flush, has };