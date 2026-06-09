const { stripHtml, truncate, removeUrls, decodeHtmlEntities, normalizeWhitespace, isCleanText } = require('../../modules/news/news.utils');
const { slugifyWithTimestamp } = require('../../utils/slugify');
const logger = require('../../utils/logger');

const pickFirst = (value) => {
    if (Array.isArray(value)) return value.find(Boolean) || null;
    return value || null;
};

const readUrl = (value) => {
    const first = pickFirst(value);
    if (!first) return null;
    if (typeof first === 'string') return first;
    return first.url || first.href || first.$?.url || first.$?.href || null;
};

const cleanUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const cleaned = decodeHtmlEntities(url).trim();
    return /^https?:\/\//i.test(cleaned) ? cleaned : null;
};

const extractImageFromHtml = (html) => {
    if (!html || typeof html !== 'string') return null;
    const decodedHtml = decodeHtmlEntities(html);

    const imgMatch = decodedHtml.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
    if (imgMatch) return upgradeImageSize(cleanUrl(imgMatch[1]));

    const srcSetMatch = decodedHtml.match(/<img[^>]+srcset=["']([^"']+)["']/i);
    if (!srcSetMatch) return null;

    const candidates = srcSetMatch[1]
        .split(',')
        .map((item) => item.trim().split(/\s+/))
        .filter((parts) => parts[0])
        .map(([url, descriptor]) => ({
            url,
            quality: descriptor ? parseInt(descriptor.replace(/[^0-9]/g, ''), 10) : 0,
        }))
        .sort((a, b) => b.quality - a.quality);

    const bestSrc = candidates[0]?.url || srcSetMatch[1].split(',')[0]?.trim().split(/\s+/)[0];
    return upgradeImageSize(cleanUrl(bestSrc));
};

const upgradeImageSize = (url) => {
    if (!url) return null;
    let upgraded = url;

    upgraded = upgraded
        .replace(/\/standard\/(?:240|480|640|720)\//g, '/standard/1024/')
        .replace(/-(?:150x150|150x|200x200|200x|300x300|300x|400x400|400x|600x600|600x|720x720|720x)/gi, '-1200x')
        .replace(/_(?:small|thumb|thumbnail)\./gi, '_large.')
        .replace(/([?&])width=\d+/gi, '$11200')
        .replace(/([?&])w=\d+/gi, '$11200')
        .replace(/([?&])height=\d+/gi, '$11200')
        .replace(/([?&])h=\d+/gi, '$11200');

    if (!/[?&](?:w|width)=/i.test(upgraded) && /[?&]/.test(upgraded)) {
        upgraded = upgraded.replace(/([?&])/, '$1width=1200&');
    }

    return upgraded;
};

// ── Comprehensive description cleaner ────────────────────────────────────────
const cleanDescriptionText = (text) => {
    if (!text || typeof text !== 'string') return null;

    // 1. Decode ALL HTML entities first — catches &#8220; &#x201C; &ldquo; etc.
    let cleaned = decodeHtmlEntities(text);

    // 2. Strip any residual HTML tags
    cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, ' ');
    cleaned = cleaned.replace(/<[^>]*>/g, ' ');

    // 3. Remove URLs
    cleaned = removeUrls(cleaned);

    // 4. Strip academic / publisher boilerplate
    cleaned = cleaned
        .replace(/^[^.;]{0,80}Published online:\s*[^;]+;\s*(?:doi:\s*10\.\S+\s*)?/i, '')
        .replace(/^doi:\s*10\.\S+\s*/i, '')
        .replace(/^Correction to:\s*/i, '');

    // 5. Remove leftover entity-like noise that decoding may have missed
    //    (e.g. any &word; pattern that isn't a real character)
    cleaned = cleaned.replace(/&[a-zA-Z]{2,10};/g, '');
    cleaned = cleaned.replace(/&#\d+;/g, '');
    cleaned = cleaned.replace(/&#x[0-9a-fA-F]+;/g, '');

    // 6. Collapse whitespace
    cleaned = normalizeWhitespace(cleaned);

    if (!cleaned || cleaned.length < 30) return null;

    // 7. Reject if still looks like markup garbage
    if (!isCleanText(cleaned)) return null;

    return cleaned;
};

const getItemText = (item) => {
    return [
        item.title,
        item.summary,
        item.description,
        item['content:encoded'],
        item.content,
        item.contentSnippet,
        item['content:encodedSnippet'],
    ]
        .map((value) => stripHtml(decodeHtmlEntities(value || '')))
        .filter(Boolean)
        .join(' ');
};

const isCorrectionOrNotice = (item) => {
    const title = normalizeWhitespace(stripHtml(item.title || '')).toLowerCase();
    const text = normalizeWhitespace(getItemText(item)).toLowerCase();

    const blockedTitlePatterns = [
        /^(author|publisher|editorial)\s+correction\s*:/,
        /^correction\s+(to|for)\b/,
        /^correction\s*:/,
        /^retraction\s+(note|notice)\s*:/,
        /^expression\s+of\s+concern\s*:/,
        /^erratum\s*:/,
        /^corrigendum\s*:/,
        /^addendum\s*:/,
    ];

    const blockedBodyPatterns = [
        /\bcorrection to:\s+/,
        /\bthis article has been corrected\b/,
        /\bthe original version of this article\b.*\b(corrected|updated)\b/,
    ];

    return (
        blockedTitlePatterns.some((pattern) => pattern.test(title)) ||
        blockedBodyPatterns.some((pattern) => pattern.test(text))
    );
};

const isLowValueArticle = (article) => {
    const title = article.title || '';
    const description = article.description || '';
    const titleWords = title.split(/\s+/).filter(Boolean).length;

    if (!article.url || !/^https?:\/\//i.test(article.url)) return true;
    if (!title || /^untitled$/i.test(title)) return true;
    if (titleWords < 2 && !description) return true;
    if (/^(author|publisher|editorial)\s+correction\s*:/i.test(title)) return true;
    if (/^correction\s+(to|for)\b/i.test(title)) return true;
    if (/^correction to:/i.test(description)) return true;

    return false;
};

const hasWeakDisplayData = (article) => {
    const title = article.title || '';
    const description = article.description || '';
    const descriptionWords = description.trim().split(/\s+/).filter(Boolean).length;

    if (!article.image || !/^https?:\/\//i.test(article.image)) return true;
    if (title.length < 18 || title.trim().split(/\s+/).filter(Boolean).length < 4) return true;
    if (description.length < 120 || descriptionWords < 25) return true;

    return false;
};

const extractImage = (item) => {
    const mediaImage =
        readUrl(item['media:content']) ||
        readUrl(item['media:thumbnail']) ||
        readUrl(item['media:group']?.['media:content']) ||
        readUrl(item['media:group']?.['media:thumbnail']) ||
        readUrl(item.image);

    if (mediaImage) {
        return upgradeImageSize(cleanUrl(mediaImage));
    }

    const enclosure = pickFirst(item.enclosure);
    const enclosureType = enclosure?.type || enclosure?.$?.type || '';
    const enclosureUrl = readUrl(enclosure);
    if (enclosureUrl && (!enclosureType || enclosureType.startsWith('image/'))) {
        return cleanUrl(enclosureUrl);
    }

    const htmlImage =
        extractImageFromHtml(item.description) ||
        extractImageFromHtml(item.summary) ||
        extractImageFromHtml(item['content:encoded']);

    if (htmlImage) {
        return htmlImage;
    }

    return null;
};

const extractDescription = (item) => {
    // Priority order: richest content first
    const candidates = [
        item['content:encoded'],
        item.summary,
        item.description,
        item.content,
        item.contentSnippet,
        item['content:encodedSnippet'],
    ];

    for (const raw of candidates) {
        if (!raw) continue;
        // Decode entities BEFORE stripping HTML so entity text survives as clean chars
        const decoded = decodeHtmlEntities(raw);
        const stripped = cleanDescriptionText(stripHtml(decoded));
        if (stripped && stripped.length > 30) {
            return truncate(stripped, 300);
        }
    }

    return null;
};

// ── Safe date parser ──────────────────────────────────────────────────────────
const parseDate = (dateString) => {
    if (!dateString) {
        return new Date().toISOString();
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            logger.warn(`Invalid date parsed: "${dateString}", using current time`);
            return new Date().toISOString();
        }
        return date.toISOString();
    } catch (err) {
        logger.warn(`Error parsing date "${dateString}": ${err.message}`);
        return new Date().toISOString();
    }
};

const normalizeItem = (item, source) => {
    // Decode entities in title too
    const title = normalizeWhitespace(stripHtml(decodeHtmlEntities(item.title || ''))) || 'Untitled';
    const url = cleanUrl(item.link) || cleanUrl(item.guid) || null;
    const publishedAt = parseDate(item.pubDate || item.isoDate || item.date || item['dc:date']);

    return {
        title,
        slug: slugifyWithTimestamp(title),
        description: extractDescription(item),
        url,
        image: extractImage(item),
        source: source.name,
        category: source.category,
        language: source.language || 'en',
        publishedAt,
        fetchedAt: new Date().toISOString(),
        needsEnrich: false,
    };
};

const normalizeSource = (items, source) => {
    let dropped = 0;

    const normalized = items
        .filter((item) => item.title && item.link)
        .filter((item) => {
            const keep = !isCorrectionOrNotice(item);
            if (!keep) dropped += 1;
            return keep;
        })
        .map((item) => {
            const normalized = normalizeItem(item, source);
            if (hasWeakDisplayData(normalized)) {
                normalized.needsEnrich = true;
            }
            return normalized;
        })
        .filter((article) => {
            const keep = !isLowValueArticle(article);
            if (!keep) dropped += 1;
            return keep;
        });

    if (dropped > 0) {
        logger.debug(`Dropped ${dropped} low-value RSS items from ${source.name}`);
    }

    return normalized;
};

module.exports = { normalizeSource };