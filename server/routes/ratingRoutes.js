const express = require('express');
const router = express.Router();
const {
  createRating,
  getUserRatings,
  getRideRatings,
  getMyRatings
} = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createRating);
router.get('/user/:userId', getUserRatings);
router.get('/ride/:rideId', getRideRatings);
router.get('/my-ratings', protect, getMyRatings);

module.exports = router;

