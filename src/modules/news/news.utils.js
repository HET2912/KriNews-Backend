const {
    DEFAULT_PAGE,
    DEFAULT_LIMIT,
    MAX_LIMIT,
    SORT_OPTIONS,
} = require('./news.constants');

const parsePagination = (query) => {
    let page = parseInt(query.page) || DEFAULT_PAGE;
    let limit = parseInt(query.limit) || DEFAULT_LIMIT;

    if (page < 1) page = DEFAULT_PAGE;
    if (limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const parseSort = (sortQuery) => {
    switch (sortQuery) {
        case SORT_OPTIONS.OLDEST: return { publishedAt: 1 };
        case SORT_OPTIONS.RELEVANT: return { score: -1 };
        case SORT_OPTIONS.LATEST:
        default: return { publishedAt: -1 };
    }
};

const buildSearchRegex = (searchQuery) => {
    if (!searchQuery || typeof searchQuery !== 'string') return null;
    const escaped = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
};

const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const truncate = (text, maxLength = 300) => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    // cut at sentence boundary if possible
    const slice = text.slice(0, maxLength);
    const lastPeriod = slice.lastIndexOf('.');
    if (lastPeriod > maxLength * 0.6) return slice.slice(0, lastPeriod + 1);
    return slice.trim() + '…';
};

const removeUrls = (text) => {
    if (!text) return '';
    return text
        .replace(/https?:\/\/[^\s<>"')]+/gi, '')
        .replace(/\bwww\.[^\s<>"')]+/gi, '')
        .trim();
};

// ── Comprehensive HTML entity decoder ────────────────────────────────────────
// Covers named entities, decimal &#NNN;, and hex &#xNNN; forms.
const decodeHtmlEntities = (text) => {
    if (!text || typeof text !== 'string') return '';

    return text
        // ── Punctuation / typography entities ──────────────────────────────
        .replace(/&#8220;|&#x201C;|&ldquo;|&OpenCurlyDoubleQuote;/g, '"')
        .replace(/&#8221;|&#x201D;|&rdquo;|&CloseCurlyDoubleQuote;/g, '"')
        .replace(/&#8216;|&#x2018;|&lsquo;|&OpenCurlySingleQuote;/g, "'")
        .replace(/&#8217;|&#x2019;|&rsquo;|&CloseCurlySingleQuote;/g, "'")
        .replace(/&#8211;|&#x2013;|&ndash;/g, '–')
        .replace(/&#8212;|&#x2014;|&mdash;/g, '—')
        .replace(/&#8230;|&#x2026;|&hellip;/g, '…')
        .replace(/&#8242;|&#x2032;|&prime;/g, "'")
        .replace(/&#8243;|&#x2033;|&Prime;/g, '"')
        .replace(/&#171;|&#xAB;|&laquo;/g, '«')
        .replace(/&#187;|&#xBB;|&raquo;/g, '»')
        .replace(/&#8249;|&#x2039;|&lsaquo;/g, '‹')
        .replace(/&#8250;|&#x203A;|&rsaquo;/g, '›')

        // ── Spaces / formatting ─────────────────────────────────────────────
        .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
        .replace(/&thinsp;|&#8201;|&#x2009;/g, ' ')
        .replace(/&ensp;|&#8194;|&#x2002;/g, ' ')
        .replace(/&emsp;|&#8195;|&#x2003;/g, ' ')
        .replace(/&zwj;|&#8205;|&#x200D;/g, '')
        .replace(/&zwnj;|&#8204;|&#x200C;/g, '')
        .replace(/&#8203;|&#x200B;/g, '')   // zero-width space

        // ── Basic XML/HTML entities ─────────────────────────────────────────
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;|&#34;/g, '"')
        .replace(/&#39;|&apos;/g, "'")

        // ── Common symbols ──────────────────────────────────────────────────
        .replace(/&copy;|&#169;|&#xA9;/g, '©')
        .replace(/&reg;|&#174;|&#xAE;/g, '®')
        .replace(/&trade;|&#8482;|&#x2122;/g, '™')
        .replace(/&bull;|&#8226;|&#x2022;/g, '•')
        .replace(/&middot;|&#183;|&#xB7;/g, '·')
        .replace(/&times;|&#215;|&#xD7;/g, '×')
        .replace(/&divide;|&#247;|&#xF7;/g, '÷')
        .replace(/&minus;|&#8722;|&#x2212;/g, '−')
        .replace(/&plus;|&#43;/g, '+')
        .replace(/&frac12;|&#189;/g, '½')
        .replace(/&frac14;|&#188;/g, '¼')
        .replace(/&frac34;|&#190;/g, '¾')
        .replace(/&deg;|&#176;|&#xB0;/g, '°')
        .replace(/&pound;|&#163;|&#xA3;/g, '£')
        .replace(/&euro;|&#8364;|&#x20AC;/g, '€')
        .replace(/&yen;|&#165;|&#xA5;/g, '¥')
        .replace(/&cent;|&#162;|&#xA2;/g, '¢')
        .replace(/&sect;|&#167;|&#xA7;/g, '§')
        .replace(/&para;|&#182;|&#xB6;/g, '¶')
        .replace(/&dagger;|&#8224;/g, '†')
        .replace(/&Dagger;|&#8225;/g, '‡')
        .replace(/&permil;|&#8240;/g, '‰')
        .replace(/&micro;|&#181;|&#xB5;/g, 'µ')

        // ── Catch-all: any remaining decimal numeric entity ─────────────────
        .replace(/&#(\d+);/g, (_, code) => {
            const n = parseInt(code, 10);
            // skip control characters, keep printable Unicode
            if (n < 32 || (n >= 127 && n < 160)) return '';
            try { return String.fromCodePoint(n); } catch { return ''; }
        })
        // ── Catch-all: any remaining hex numeric entity ─────────────────────
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
            const n = parseInt(hex, 16);
            if (n < 32 || (n >= 127 && n < 160)) return '';
            try { return String.fromCodePoint(n); } catch { return ''; }
        })
        // ── Any leftover & entity that didn't match — just strip the & ──────
        .replace(/&[a-zA-Z]{2,8};/g, '');
};

// ── Strict description cleaner ────────────────────────────────────────────────
// Applied AFTER stripHtml + decodeHtmlEntities.
// Rejects text that still looks like raw markup / junk.
const normalizeWhitespace = (text) => {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
};

// Returns null if text looks like residual markup or is too noisy.
const isCleanText = (text) => {
    if (!text) return false;
    // reject if encoded entities survive (e.g. "&#" or "&amp;" still present)
    if (/&#\d+;|&#x[0-9a-f]+;/i.test(text)) return false;
    if (/&[a-zA-Z]{2,8};/.test(text)) return false;
    // reject if raw HTML tags survive
    if (/<[a-z][\s\S]*?>/i.test(text)) return false;
    // reject if too many non-ASCII junk characters (encoding artefacts)
    const junkRatio = (text.match(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]/g) || []).length / text.length;
    if (junkRatio > 0.08) return false;
    return true;
};

module.exports = {
    parsePagination,
    parseSort,
    buildSearchRegex,
    stripHtml,
    truncate,
    removeUrls,
    decodeHtmlEntities,
    normalizeWhitespace,
    isCleanText,
};