const userService = require('./user.service');
const { sendSuccess, sendError } = require('../../utils/response');
const { updateAvatar, deleteAvatar } = require('./user.service');

const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getProfile(req.user.id);
        return sendSuccess(res, { user }, 'Profile fetched');
    } catch (err) {
        next(err);
    }
};

const uploadAvatar = async (req, res, next) => {
    try {
        console.log("1 → controller start");

        if (!req.file) {
            console.log("2 → no file");
            return sendError(res, "No file uploaded", 422);
        }

        console.log("3 → file exists");

        const user = await updateAvatar(req.user.id, req.file);

        console.log("4 → user updated");

        const response = sendSuccess(
            res,
            { avatar: user.avatar },
            "Avatar updated successfully"
        );

        console.log("5 → response sent");

        return response;

    } catch (err) {
        console.log("CONTROLLER ERROR:", err);
        next(err);
    }
};

const removeAvatar = async (req, res, next) => {
    try {
        await deleteAvatar(req.user.id);
        return sendSuccess(res, null, 'Avatar removed successfully');
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, language, categories } = req.body;
        const user = await userService.updateProfile(req.user.id, { name, language, categories });
        return sendSuccess(res, { user }, 'Profile updated successfully');
    } catch (err) {
        next(err);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await userService.changePassword(req.user.id, { currentPassword, newPassword });
        return sendSuccess(res, null, result.message);
    } catch (err) {
        next(err);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        const result = await userService.deleteAccount(req.user.id);
        return sendSuccess(res, null, result.message);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getProfile, updateProfile, changePassword, deleteAccount, uploadAvatar,
    removeAvatar,
};