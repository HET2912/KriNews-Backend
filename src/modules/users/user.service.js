const User = require('./user.model');
const { updateProfileValidator, changePasswordValidator } = require('./user.validator');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinary.utils');

const getProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return user;
};

const updateAvatar = async (userId, file) => {
    if (!file) {
        const err = new Error('No file provided');
        err.statusCode = 422;
        throw err;
    }

    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // delete old avatar from cloudinary if one exists
    if (user.avatar) {
        await deleteFromCloudinary(user.avatar);
    }

    // upload new one
    const result = await uploadToCloudinary(file.buffer, file.mimetype, userId);

    user.avatar = result.secure_url;
    await user.save({ validateBeforeSave: false });

    return user;
};

const deleteAvatar = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    if (!user.avatar) {
        const err = new Error('No avatar to delete');
        err.statusCode = 400;
        throw err;
    }

    await deleteFromCloudinary(user.avatar);

    user.avatar = null;
    await user.save({ validateBeforeSave: false });

    return user;
};

const updateProfile = async (userId, data) => {
    const errors = updateProfileValidator(data);
    if (errors.length > 0) {
        const err = new Error(errors.join('. '));
        err.statusCode = 422;
        throw err;
    }

    // whitelist what can be updated
    const allowed = {};
    if (data.name) allowed.name = data.name.trim();
    if (data.language) allowed['preferences.language'] = data.language;
    if (data.categories) allowed['preferences.categories'] = data.categories;

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: allowed },
        { new: true, runValidators: true }
    );

    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    return user;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
    const errors = changePasswordValidator({ currentPassword, newPassword });
    if (errors.length > 0) {
        const err = new Error(errors.join('. '));
        err.statusCode = 422;
        throw err;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        const err = new Error('Current password is incorrect');
        err.statusCode = 401;
        throw err;
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
};

const deleteAccount = async (userId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
    );
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return { message: 'Account deactivated successfully' };
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    updateAvatar,    
    deleteAvatar,    
};