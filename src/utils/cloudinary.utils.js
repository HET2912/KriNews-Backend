const cloudinary = require('../config/cloudinary');
const logger = require('./logger');

const uploadToCloudinary = (fileBuffer, mimetype, userId) => {
    return new Promise((resolve, reject) => {
        const folder = 'newsapp/avatars';
        const publicId = `avatar_${userId}_${Date.now()}`;
        const resourceType = 'image';

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: resourceType,
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // auto crop to face
                    { quality: 'auto', fetch_format: 'auto' },                  // auto optimize
                ],
                overwrite: true,
            },
            (error, result) => {
                if (error) {
                    logger.error(`Cloudinary upload failed for user ${userId}: ${error.message}`);
                    return reject(error);
                }
                logger.debug(`Cloudinary upload success: ${result.secure_url}`);
                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

const deleteFromCloudinary = async (avatarUrl) => {
    try {
        if (!avatarUrl) return;

        // extract public_id from the URL
        // url format: https://res.cloudinary.com/<cloud>/image/upload/v123/<folder>/<public_id>.ext
        const parts = avatarUrl.split('/');
        const filename = parts[parts.length - 1];                      // avatar_xxx.jpg
        const folder = parts[parts.length - 2];                      // avatars
        const parent = parts[parts.length - 3];                      // newsapp
        const publicId = `${parent}/${folder}/${filename.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
        logger.debug(`Cloudinary delete success: ${publicId}`);
    } catch (err) {
        // non-fatal — log and move on, don't block the main operation
        logger.warn(`Cloudinary delete failed: ${err.message}`);
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };