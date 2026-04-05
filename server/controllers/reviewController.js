const Review = require('../models/Review');
const Product = require('../models/Product');

// Recalculate and save average rating on the Product doc
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].average * 10) / 10,
      'ratings.count': stats[0].count
    });
  } else {
    await Product.findByIdAndUpdate(productId, { 'ratings.average': 0, 'ratings.count': 0 });
  }
};

// GET all reviews for a product
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// POST a new review (authenticated user)
exports.createReview = async (req, res, next) => {
  try {
    const { rating, title, body } = req.body;

    // Check if already reviewed
    const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      rating,
      title,
      body
    });

    await updateProductRating(review.product);

    const populated = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    next(error);
  }
};

// DELETE a review (owner only)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
