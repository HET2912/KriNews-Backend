const { env } = require('./env');

const allowedOrigins = [
    env.clientUrl,
    'http://localhost:3000',
    'http://localhost:5173',
    'exp://192.168.1.22:8081'
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // allow requests with no origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
    },
    credentials: true,              // allow cookies / auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],  // useful for pagination headers later
    maxAge: 86400,                  // preflight cache — 24 hours
};

module.exports = { corsOptions };