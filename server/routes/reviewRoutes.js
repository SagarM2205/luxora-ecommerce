const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to get :productId from parent
const { protect } = require('../middleware/auth');
const { getProductReviews, createReview, deleteReview } = require('../controllers/reviewController');

router.get('/', getProductReviews);
router.post('/', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
