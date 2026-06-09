const axios = require('axios');
const logger = require('./logger');
const cheerio = require('cheerio');
const ogs = require('open-graph-scraper');

const MIN_WORDS = 500;
const MAX_WORDS = 900;
const ARTICLE_FETCH_TIMEOUT_MS = 20000;
const ARTICLE_MAX_BYTES = 20 * 1024 * 1024;
const DEFAULT_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    Connection: 'keep-alive',
    Referer: 'https://www.google.com/',
};

const decodeHtmlEntities = (text) => {
    if (!text || typeof text !== 'string') return '';

    return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

const cleanText = (text) => {
    return decodeHtmlEntities(
        text
            .replace(/<[^>]+>/g, ' ')
            .replace(/https?:\/\/[^\s<>"')]+/gi, '')
            .replace(/\bwww\.[^\s<>"')]+/gi, '')
            .replace(/\s+/g, ' ')
            .trim()
    );
};

const extractParagraphs = (html) => {
    const paragraphs = [];

    // try article tags first
    const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    let articleMatch;

    while ((articleMatch = articleRegex.exec(html)) !== null) {
        const content = articleMatch[1];

        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let pMatch;

        while ((pMatch = pRegex.exec(content)) !== null) {
            const text = cleanText(pMatch[1]);

            if (text.length > 80) {
                paragraphs.push(text);
            }
        }
    }

    // fallback to all p tags if article not found
    if (paragraphs.length === 0) {
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let match;

        while ((match = pRegex.exec(html)) !== null) {
            const text = cleanText(match[1]);

            if (text.length > 80) {
                paragraphs.push(text);
            }
        }
    }

    return paragraphs;
};

const scrapeArticleText = async (url) => {
    try {
        const res = await axios.get(url, {
            timeout: ARTICLE_FETCH_TIMEOUT_MS,
            maxContentLength: ARTICLE_MAX_BYTES,
            maxBodyLength: ARTICLE_MAX_BYTES,
            proxy: false,
            headers: DEFAULT_HEADERS,
        });

        const html = res.data;

        const $ = cheerio.load(html);

        // remove junk
        $(
            'script, style, noscript, svg, nav, footer, header, aside, form, iframe'
        ).remove();

        const paragraphs = [];

        // BEST selectors first
        const selectors = [
            'article p',
            '[class*="article"] p',
            '[class*="content"] p',
            '[class*="story"] p',
            '[class*="post"] p',
            'main p',
            '.article-body p',
            '.story-body p',
            '.entry-content p',
            'p',
        ];

        for (const selector of selectors) {
            $(selector).each((_, el) => {
                const text = $(el)
                    .text()
                    .replace(/\s+/g, ' ')
                    .trim();

                if (
                    text.length > 60 &&
                    !paragraphs.includes(text)
                ) {
                    paragraphs.push(text);
                }
            });

            // stop if enough text collected
            const currentWords = paragraphs
                .join(' ')
                .split(/\s+/).length;

            if (currentWords >= 500) {
                break;
            }
        }

        if (!paragraphs.length) {
            return null;
        }

        let finalText = paragraphs.join(' ');

        // normalize
        finalText = finalText
            .replace(/\s+/g, ' ')
            .trim();

        const words = finalText.split(/\s+/);

        // hard cap
        if (words.length > 900) {
            finalText = words.slice(0, 900).join(' ');
        }

        // minimum useful text
        if (words.length < 20) {
            return null;
        }

        return finalText;
    } catch (err) {
        logger.debug(
            `Article text scrape failed for ${url}: ${err.message}`
        );

        return null;
    }
};

const scrapeOG = async (url) => {
    if (!url) {
        return {
            title: null,
            image: null,
            description: null,
        };
    }

    try {
        let og = null;
        let bodyText = null;

        // run independently so one failure doesn't kill everything
        try {
            const ogResult = await ogs({
                url,
                timeout: 10000,
                fetchOptions: {
                    headers: DEFAULT_HEADERS,
                },
            });

            og = ogResult.result;
        } catch (err) {
            logger.debug(`OG scrape failed: ${err.message}`);
        }

        try {
            bodyText = await scrapeArticleText(url);
        } catch (err) {
            logger.debug(`Article scrape failed: ${err.message}`);
        }

        const title =
            og?.ogTitle ||
            og?.twitterTitle ||
            og?.dcTitle ||
            null;

        // MUCH STRONGER DESCRIPTION FALLBACKS
        const ogDesc =
            og?.ogDescription ||
            og?.twitterDescription ||
            og?.description ||
            og?.dcDescription ||
            null;

        const chooseBestImage = (images) => {
            if (!images) return null;
            const list = Array.isArray(images) ? images : [images];
            const candidates = list
                .map((img) => {
                    if (!img) return null;
                    if (typeof img === 'string') return { url: img, width: 0, height: 0 };
                    return {
                        url: img.url || img.secure_url || img['#url'] || null,
                        width: Number(img.width) || Number(img.w) || 0,
                        height: Number(img.height) || Number(img.h) || 0,
                    };
                })
                .filter((item) => item?.url)
                .map((item) => ({
                    ...item,
                    score: Math.max(item.width, item.height, 0),
                }))
                .sort((a, b) => b.score - a.score);
            return candidates[0]?.url || null;
        };

        const image =
            chooseBestImage(og?.ogImage) ||
            chooseBestImage(og?.twitterImage) ||
            chooseBestImage(og?.image) ||
            null;

        // prioritize article body
        const description =
            bodyText ||
            ogDesc ||
            null;

        return {
            title,
            image,
            description,
        };
    } catch (err) {
        logger.debug(`scrapeOG failed for ${url}: ${err.message}`);

        return {
            title: null,
            image: null,
            description: null,
        };
    }
};

module.exports = { scrapeOG };
