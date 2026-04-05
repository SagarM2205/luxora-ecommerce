const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validateCoupon, createCoupon } = require('../controllers/couponController');

router.post('/validate', protect, validateCoupon);
router.post('/', protect, admin, createCoupon);

module.exports = router;
