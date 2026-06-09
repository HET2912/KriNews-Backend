const router = require('express').Router();
const bookmarkController = require('./bookmark.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// all bookmark routes are protected
router.use(authenticate);

router.get('/', bookmarkController.getAllBookmarks);
router.get('/liked', bookmarkController.getLiked);
router.get('/read-later', bookmarkController.getReadLater);
router.get('/status', bookmarkController.checkBookmarkStatus);
router.get('/counts', bookmarkController.getBookmarkCounts);

router.post('/', bookmarkController.addBookmark);
router.delete('/remove-by-article', bookmarkController.removeBookmarkByArticle);
router.delete('/clear/:type', bookmarkController.clearBookmarks);
router.delete('/:id', bookmarkController.removeBookmark);
router.patch('/:id/switch', bookmarkController.switchBookmarkType);

module.exports = router;