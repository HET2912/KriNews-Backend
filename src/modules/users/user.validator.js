const { CATEGORIES } = require('../news/news.constants');

const updateProfileValidator = (data) => {
    const errors = [];

    const { name, language, categories } = data;

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }
        if (name.trim().length > 50) {
            errors.push('Name cannot exceed 50 characters');
        }
    }

    if (language !== undefined) {
        const supported = ['en', 'hi', 'gu', 'de', 'fr', 'es'];
        if (!supported.includes(language)) {
            errors.push(`Language must be one of: ${supported.join(', ')}`);
        }
    }

    if (categories !== undefined) {
        if (!Array.isArray(categories)) {
            errors.push('Categories must be an array');
        } else {
            const valid = Array.isArray(CATEGORIES) ? CATEGORIES : [];
            const invalid = categories.filter((c) => !valid.includes(c));
            if (invalid.length > 0) {
                errors.push(`Invalid categories: ${invalid.join(', ')}`);
            }
        }
    }

    return errors;
};

const changePasswordValidator = (data) => {
    const errors = [];

    const { currentPassword, newPassword } = data;

    if (!currentPassword) {
        errors.push('Current password is required');
    }
    if (!newPassword || newPassword.length < 8) {
        errors.push('New password must be at least 8 characters');
    }
    if (newPassword && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        errors.push('New password must contain uppercase, lowercase, and a number');
    }
    if (currentPassword && newPassword && currentPassword === newPassword) {
        errors.push('New password must be different from current password');
    }

    return errors;
};

module.exports = { updateProfileValidator, changePasswordValidator };