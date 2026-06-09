const VALID_TYPES = ['liked', 'read_later'];

const addBookmarkValidator = (data) => {
    const errors = [];
    const { articleUrl, title, type } = data;

    if (!articleUrl || typeof articleUrl !== 'string' || !articleUrl.startsWith('http')) {
        errors.push('A valid article URL is required');
    }

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
        errors.push('Article title is required');
    }

    if (!type || !VALID_TYPES.includes(type)) {
        errors.push(`Type must be one of: ${VALID_TYPES.join(', ')}`);
    }

    return errors;
};

const updateBookmarkTypeValidator = (data) => {
    const errors = [];
    const { type } = data;

    if (!type || !VALID_TYPES.includes(type)) {
        errors.push(`Type must be one of: ${VALID_TYPES.join(', ')}`);
    }

    return errors;
};

module.exports = { addBookmarkValidator, updateBookmarkTypeValidator, VALID_TYPES };