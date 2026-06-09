const router = require('express').Router();
const userController = require('./user.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { upload, handleUploadError } = require('../../middlewares/upload.middleware');


// all user routes are protected
router.use(authenticate);

router.get('/', userController.getProfile);
router.patch('/update', userController.updateProfile);
router.patch('/change-password', userController.changePassword);
router.delete('/delete', userController.deleteAccount);
router.patch(
    '/avatar',
    upload.single('avatar'),
    handleUploadError,
    userController.uploadAvatar
);

router.delete('/avatar', userController.removeAvatar);

module.exports = router;