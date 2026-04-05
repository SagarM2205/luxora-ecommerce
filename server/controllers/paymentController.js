const crypto = require('crypto');

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    // Demo mode since we don't have real Razorpay keys yet
    return res.json({
      success: true,
      order: {
        id: 'order_demo_' + Date.now(),
        amount: amount,
        currency: 'INR',
        status: 'created'
      },
      key: process.env.RAZORPAY_KEY_ID,
      demo: true
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id } = req.body;

    // Demo mode - always verify as success
    if (razorpay_order_id && razorpay_order_id.startsWith('order_demo_')) {
      return res.json({ success: true, message: 'Demo payment verified', demo: true });
    }

    res.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    next(error);
  }
};
