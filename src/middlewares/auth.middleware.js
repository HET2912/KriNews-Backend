const { verifyToken } = require('../modules/auth/jwt.utils');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'Access denied. No token provided.', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return sendError(res, 'Access denied. Malformed token.', 401);
        }

        const decoded = verifyToken(token);
        req.user = decoded;    // { id, email, role } available downstream
        next();

    } catch (err) {
        logger.warn(`Auth middleware error: ${err.message}`);

        if (err.name === 'TokenExpiredError') {
            return sendError(res, 'Session expired. Please log in again.', 401);
        }
        if (err.name === 'JsonWebTokenError') {
            return sendError(res, 'Invalid token.', 401);
        }

        return sendError(res, 'Authentication failed.', 401);
    }
};

// Use this on routes that are only for admins
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return sendError(res, 'Access denied. Admins only.', 403);
    }
    next();
};

module.exports = { authenticate, authorizeAdmin };