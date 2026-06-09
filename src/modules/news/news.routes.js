const router = require('express').Router();
const newsController = require('./news.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { triggerManualRefresh } = require('../rss/rss.scheduler');

// public routes — no auth needed to read news
router.get('/', newsController.getAllNews);
router.get('/search', newsController.searchNews);
router.get('/sources', newsController.getSources);
router.get('/stats', newsController.getStats);
router.get('/enrichment-status', newsController.getEnrichmentStatus);
router.get('/category/:category', newsController.getNewsByCategory);
router.get('/feed', authenticate, newsController.getFeed);
router.get('/:slug', newsController.getNewsBySlug);  // keep last — catch-all param
router.post('/refresh', authenticate, (req, res, next) => {
    try {
        triggerManualRefresh();
        res.status(200).json({ success: true, message: 'News refresh started' });
    } catch (err) {
        next(err);
    }
});
// TEMPORARY — remove after use
router.post('/news/nuke', async (req, res) => {
    const { setNewsStore } = require('../news/news.service');
    const { triggerManualRefresh } = require('../rss/rss.scheduler');
    const cache = require('../../utils/cache');

    setNewsStore([]);      // wipe all articles
    cache.flush();         // wipe OG/enrich cache

    res.json({ success: true, message: 'Store wiped, fetching fresh...' });

    await triggerManualRefresh(); // re-fetch in background
});

module.exports = router;