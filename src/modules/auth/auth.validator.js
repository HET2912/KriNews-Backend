const registerValidator = (data) => {
    const errors = [];

    const { name, email, password } = data;

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    if (name && name.trim().length > 50) {
        errors.push('Name cannot exceed 50 characters');
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Please provide a valid email');
    }

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.push('Password must contain uppercase, lowercase, and a number');
    }

    return errors;
};

const loginValidator = (data) => {
    const errors = [];

    const { email, password } = data;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Please provide a valid email');
    }
    if (!password) {
        errors.push('Password is required');
    }

    return errors;
};

module.exports = { registerValidator, loginValidator };