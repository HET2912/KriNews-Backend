const slugify = (text) => {
    if (!text || typeof text !== 'string') return '';

    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')   // remove special chars
        .replace(/[\s_]+/g, '-')    // spaces and underscores to hyphens
        .replace(/--+/g, '-')       // collapse multiple hyphens
        .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
};

const slugifyWithTimestamp = (text) => {
    const base = slugify(text);
    const suffix = Date.now().toString(36); // short base36 timestamp
    return `${base}-${suffix}`;
};

module.exports = { slugify, slugifyWithTimestamp };