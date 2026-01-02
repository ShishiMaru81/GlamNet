const express = require('express');
const {
  getRecommendations,
  getPopularServices
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/popular-services', getPopularServices);
router.get('/', protect, getRecommendations);

module.exports = router;


