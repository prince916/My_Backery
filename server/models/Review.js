const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating:  { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    title:   { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: [true, 'Review comment is required'], maxlength: 1000 },
    images:  [{ public_id: String, url: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved:         { type: Boolean, default: true },
    helpfulVotes:       { type: Number, default: 0 },
    reportCount:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product ratings after save/remove
reviewSchema.statics.calcRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', numReviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
  ]);
  const Product = require('./Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numReviews: stats[0].numReviews,
      ratings:    Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { numReviews: 0, ratings: 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcRatings(this.product);
});

reviewSchema.post('remove', function () {
  this.constructor.calcRatings(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
