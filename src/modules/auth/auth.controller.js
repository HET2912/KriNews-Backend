const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const { user, token } = await authService.register({ name, email, password });

        return sendSuccess(
            res,
            { user, token },
            'Account created successfully',
            201
        );
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login({ email, password });

        return sendSuccess(res, { user, token }, 'Logged in successfully');
    } catch (err) {
        next(err);
    }
};

// Stateless JWT logout — client drops the token
// If you add a token blacklist later, handle it here
const logout = async (req, res) => {
    return sendSuccess(res, null, 'Logged out successfully');
};

const me = async (req, res, next) => {
    try {
        const User = require('../users/user.model');
        const user = await User.findById(req.user.id);

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        return sendSuccess(res, { user }, 'Profile fetched');
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, logout, me };