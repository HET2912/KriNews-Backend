const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 2;

// use memory storage — we stream buffer directly to cloudinary
// no temp files written to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
        err.statusCode = 422;
        cb(err, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,   // 2MB in bytes
        files: 1,
    },
});

// multer error handler — wraps multer-specific errors into our format
const handleUploadError = (err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        err.statusCode = 422;
        err.message = `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        err.statusCode = 422;
        err.message = 'Only one file allowed per upload';
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        err.statusCode = 422;
        err.message = 'Unexpected field name. Use "avatar" as the field name';
    }
    next(err);
};

module.exports = { upload, handleUploadError };