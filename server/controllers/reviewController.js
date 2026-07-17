const Review  = require('../models/Review');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const { catchAsync, AppError } = require('../middleware/error');
const { uploadToCloudinary } = require('../config/cloudinary');

// ── Create review ──────────────────────────────────────────
exports.createReview = catchAsync(async (req, res, next) => {
  const { rating, title, comment, productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));

  // Check if user already reviewed this product
  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) return next(new AppError('You have already reviewed this product', 400));

  // Check if user has purchased the product (for verified purchase badge)
  const hasPurchased = await Order.findOne({
    user:   req.user._id,
    status: 'delivered',
    'items.product': productId,
  });

  // Upload review images
  let images = [];
  if (req.files && req.files.length > 0) {
    images = await Promise.all(
      req.files.map((file) => {
        const b64     = Buffer.from(file.buffer).toString('base64');
        const dataUri = `data:${file.mimetype};base64,${b64}`;
        return uploadToCloudinary(dataUri, 'mybakery/reviews');
      })
    );
  }

  const review = await Review.create({
    product: productId,
    user:    req.user._id,
    order:   hasPurchased?._id,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: !!hasPurchased,
  });

  const populated = await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review: populated });
});

// ── Get product reviews ────────────────────────────────────
exports.getProductReviews = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip  = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, reviews, total, distribution, pages: Math.ceil(total / limit) });
});

// ── Update review ──────────────────────────────────────────
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));

  Object.assign(review, req.body);
  await review.save();
  res.json({ success: true, review });
});

// ── Delete review ──────────────────────────────────────────
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

// ── Admin: Get all reviews ────────────────────────────────
exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find()
    .populate('user',    'name email')
    .populate('product', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

exports.toggleReviewApproval = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  review.isApproved = !review.isApproved;
  await review.save();
  res.json({ success: true, review });
});
