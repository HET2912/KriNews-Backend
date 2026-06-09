const RSSParser = require('rss-parser');
const axios = require('axios');
const logger = require('../../utils/logger');

const RSS_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9',
};

const parser = new RSSParser({
    timeout: 10000,   // 10 seconds per feed
    maxRedirects: 5,
    headers: RSS_HEADERS,
    customFields: {
        item: [
            ['media:content', 'media:content', { keepArray: false }],
            ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
            ['content:encoded', 'content:encoded'],
        ],
    },
});

const sanitizeXml = (xml) => {
    if (!xml || typeof xml !== 'string') return xml;

    return xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
};

const fetchSingleSource = async (source) => {
    try {
        const response = await axios.get(source.url, {
            timeout: 15000,
            maxContentLength: 10 * 1024 * 1024,
            maxBodyLength: 10 * 1024 * 1024,
            responseType: 'text',
            transformResponse: [(data) => data],
            proxy: false,
            headers: RSS_HEADERS,
        });

        const feed = await parser.parseString(sanitizeXml(response.data));
        const items = feed.items || [];
        logger.debug(`Fetched ${items.length} items from ${source.name}`);
        return { source, items, error: null };
    } catch (err) {
        logger.warn(`Failed to fetch ${source.name} (${source.url}): ${err.message}`);
        return { source, items: [], error: err.message };
    }
};

const fetchAllSources = async (sources) => {
    logger.info(`Fetching ${sources.length} RSS sources...`);

    // fetch all concurrently — failed ones return empty items, don't block others
    const results = await Promise.allSettled(
        sources.map((source) => fetchSingleSource(source))
    );

    const successful = [];
    const failed = [];

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            if (result.value.error) {
                failed.push(result.value.source.name);
            } else {
                successful.push(result.value);
            }
        } else {
            logger.error(`Unexpected fetch error: ${result.reason}`);
        }
    });

    logger.info(`RSS fetch complete — success: ${successful.length}, failed: ${failed.length}`);
    if (failed.length > 0) {
        logger.warn(`Failed sources: ${failed.join(', ')}`);
    }

    return successful;
};

module.exports = { fetchSingleSource, fetchAllSources };
