const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getDashboardStats, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/orderController');

router.use(protect);
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/stats', admin, getDashboardStats);
router.get('/:id', getOrder);
router.get('/', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
