const Coupon = require('../models/Coupon');

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discountPercentage: coupon.discountPercentage,
      maxDiscountAmount: coupon.maxDiscountAmount,
      code: coupon.code
    });
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercentage, maxDiscountAmount, expiryDate } = req.body;
    
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
       return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discountPercentage,
      maxDiscountAmount,
      expiryDate
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};
