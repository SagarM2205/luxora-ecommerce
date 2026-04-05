const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpayInstance = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

// Helper to calculate secure prices from DB entities
const calculateOrderPrices = async (userId, couponCode) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const p = item.product;
    if (!p) continue;
    itemsPrice += p.price * item.quantity;
    orderItems.push({
      product: p._id,
      name: p.name,
      image: p.images[0],
      price: p.price,
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || ''
    });
  }

  const taxPrice = Math.round(itemsPrice * 0.18);
  const shippingPrice = 0;
  let discount = 0;
  let appliedCode = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && (!coupon.expiryDate || new Date() <= new Date(coupon.expiryDate))) {
      discount = Math.round((itemsPrice * coupon.discountPercentage) / 100);
      if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
      appliedCode = coupon.code;
    }
  }

  const totalPrice = itemsPrice + taxPrice + shippingPrice - discount;

  return { orderItems, itemsPrice, taxPrice, shippingPrice, discount, totalPrice, appliedCode };
};

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    if (paymentMethod !== 'cod') {
      return res.status(400).json({ success: false, message: 'Invalid payment method for standard order' });
    }

    const pricing = await calculateOrderPrices(req.user._id, couponCode);

    const order = await Order.create({
      user: req.user._id,
      items: pricing.orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: pricing.itemsPrice,
      taxPrice: pricing.taxPrice,
      shippingPrice: pricing.shippingPrice,
      discount: pricing.discount,
      couponApplied: pricing.appliedCode,
      totalPrice: pricing.totalPrice,
      status: 'confirmed'
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.status(201).json({ success: true, order });
  } catch (error) {
    if (error.message === 'Cart is empty') {
       return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    next(error);
  }
};

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { shippingAddress, couponCode } = req.body; 

    if (!razorpayInstance) {
      return res.status(500).json({ success: false, message: 'Razorpay not configured on server' });
    }

    const pricing = await calculateOrderPrices(req.user._id, couponCode);

    const options = {
      amount: Math.round(pricing.totalPrice * 100), // convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().substring(0, 5)}`
    };

    const rzpOrder = await razorpayInstance.orders.create(options);
    
    // Create 'pending' order in our DB associated with razorpay order ID
    const order = await Order.create({
      user: req.user._id,
      items: pricing.orderItems,
      shippingAddress,
      paymentMethod: 'razorpay',
      paymentInfo: {
        razorpayOrderId: rzpOrder.id
      },
      itemsPrice: pricing.itemsPrice,
      taxPrice: pricing.taxPrice,
      shippingPrice: pricing.shippingPrice,
      discount: pricing.discount,
      couponApplied: pricing.appliedCode,
      totalPrice: pricing.totalPrice,
      status: 'pending' // pending until verified
    });

    res.json({ success: true, order: rzpOrder, dbOrderId: order._id, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    if (error.message === 'Cart is empty') {
       return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    next(error);
  }
};

exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpay_order_id });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.status = 'confirmed';
      order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
      order.paymentInfo.razorpaySignature = razorpay_signature;
      order.paymentInfo.paidAt = new Date();
      await order.save();

      // Clear the Cart
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

      res.json({ success: true, message: "Payment verified successfully", order });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images price');
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (status === 'delivered') order.deliveredAt = Date.now();

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const orders = await Order.find();
    
    const totalRevenue = orders.reduce((sum, order) => {
      // Only count confirmed/shipped/delivered orders
      if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
        return sum + order.totalPrice;
      }
      return sum;
    }, 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name');

    res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalUsers,
        totalProducts
      },
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};
