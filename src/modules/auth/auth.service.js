const User = require('../users/user.model');
const { signToken } = require('./jwt.utils');
const { registerValidator, loginValidator } = require('./auth.validator');

const buildUserPayload = (user) => ({
    id: user._id,
    email: user.email,
    role: user.role,
});

const register = async ({ name, email, password }) => {
    // validate
    const errors = registerValidator({ name, email, password });
    if (errors.length > 0) {
        const err = new Error(errors.join('. '));
        err.statusCode = 422;
        throw err;
    }

    // check duplicate
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        const err = new Error('An account with this email already exists');
        err.statusCode = 409;
        throw err;
    }

    const user = await User.create({ name, email, password });
    const token = signToken(buildUserPayload(user));

    return { user, token };
};

const login = async ({ email, password }) => {
    // validate
    const errors = loginValidator({ email, password });
    if (errors.length > 0) {
        const err = new Error(errors.join('. '));
        err.statusCode = 422;
        throw err;
    }

    // find user — explicitly select password back in
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    if (!user.isActive) {
        const err = new Error('Your account has been deactivated. Contact support.');
        err.statusCode = 403;
        throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    // update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(buildUserPayload(user));

    return { user, token };
};

module.exports = { register, login };