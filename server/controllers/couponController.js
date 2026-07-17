const Coupon = require('../models/Coupon');
const { catchAsync, AppError } = require('../middleware/error');

// ── Validate coupon ────────────────────────────────────────
exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon || !coupon.isValid) {
    return next(new AppError('Invalid or expired coupon code', 400));
  }

  if (orderAmount < coupon.minOrderAmount) {
    return next(new AppError(`Minimum order amount is ₹${coupon.minOrderAmount} for this coupon`, 400));
  }

  const userUsed = coupon.usedBy.filter((id) => id.toString() === req.user._id.toString()).length;
  if (userUsed >= coupon.userUsageLimit) {
    return next(new AppError('You have already used this coupon', 400));
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = Math.min(coupon.discountValue, orderAmount);
  }

  res.json({
    success: true,
    coupon: {
      code:           coupon.code,
      discountType:   coupon.discountType,
      discountValue:  coupon.discountValue,
      description:    coupon.description,
      discountAmount: Math.round(discount * 100) / 100,
    },
  });
});

// ── Admin CRUD ─────────────────────────────────────────────
exports.getCoupons = catchAsync(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

exports.createCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

exports.updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return next(new AppError('Coupon not found', 404));
  res.json({ success: true, coupon });
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});
