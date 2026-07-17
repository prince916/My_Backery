const Order  = require('../models/Order');
const Cart   = require('../models/Cart');
const Product= require('../models/Product');
const Coupon = require('../models/Coupon');
const { catchAsync, AppError } = require('../middleware/error');
const { sendEmail } = require('../utils/emailUtils');

const TAX_RATE      = 0.05;  // 5% GST
const SHIPPING_FREE = 500;   // Free shipping over ₹500
const SHIPPING_COST = 50;    // Fixed shipping

// ── Create order ───────────────────────────────────────────
exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    deliveryDate,
    deliveryTime,
    specialInstructions,
  } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError('No order items provided', 400));
  }

  // Validate products and calculate prices
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return next(new AppError(`Product ${item.product} not found`, 404));
    if (!product.isAvailable) return next(new AppError(`${product.name} is currently unavailable`, 400));
    if (product.stock < item.quantity) return next(new AppError(`Insufficient stock for ${product.name}`, 400));

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    itemsPrice += price * item.quantity;

    orderItems.push({
      product:     product._id,
      name:        product.name,
      image:       product.images[0]?.url,
      price,
      quantity:    item.quantity,
      flavor:      item.flavor,
      size:        item.size,
      specialNote: item.specialNote,
    });
  }

  // Coupon validation
  let discountAmount = 0;
  let appliedCoupon  = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon) return next(new AppError('Invalid coupon code', 400));
    if (!coupon.isValid) return next(new AppError('This coupon is expired or fully used', 400));
    if (itemsPrice < coupon.minOrderAmount) {
      return next(new AppError(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`, 400));
    }

    const userUsageCount = coupon.usedBy.filter(
      (id) => id.toString() === req.user._id.toString()
    ).length;
    if (userUsageCount >= coupon.userUsageLimit) {
      return next(new AppError('You have already used this coupon', 400));
    }

    if (coupon.discountType === 'percentage') {
      discountAmount = (itemsPrice * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    } else {
      discountAmount = Math.min(coupon.discountValue, itemsPrice);
    }
    appliedCoupon = coupon;
  }

  const priceAfterDiscount = itemsPrice - discountAmount;
  const taxPrice           = Math.round(priceAfterDiscount * TAX_RATE * 100) / 100;
  const shippingPrice      = priceAfterDiscount >= SHIPPING_FREE ? 0 : SHIPPING_COST;
  const totalPrice         = Math.round((priceAfterDiscount + taxPrice + shippingPrice) * 100) / 100;

  const order = await Order.create({
    user:         req.user._id,
    items:        orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    discountAmount,
    taxPrice,
    shippingPrice,
    totalPrice,
    coupon:       appliedCoupon?._id,
    couponCode:   appliedCoupon?.code,
    deliveryDate,
    deliveryTime,
    specialInstructions,
    statusHistory: [{ status: 'pending', note: 'Order placed successfully' }],
  });

  // Update coupon usage
  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    appliedCoupon.usedBy.push(req.user._id);
    await appliedCoupon.save();
  }

  // Deduct stock
  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    )
  );

  // Clear user cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, couponCode: null });

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed — ${order.orderNumber}`,
      template: 'orderConfirmation',
      data: { name: req.user.name, order },
    });
  } catch { /* Non-blocking */ }

  const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');
  res.status(201).json({ success: true, order: populatedOrder });
});

// ── Get my orders ──────────────────────────────────────────
exports.getMyOrders = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .populate('items.product', 'name images slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, orders, total, pages: Math.ceil(total / limit), currentPage: page });
});

// ── Get single order ───────────────────────────────────────
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images slug')
    .populate('user', 'name email');

  if (!order) return next(new AppError('Order not found', 404));

  // Only admin or order owner can view
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this order', 403));
  }

  res.json({ success: true, order });
});

// ── Cancel order ───────────────────────────────────────────
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  const cancelableStatuses = ['pending', 'confirmed'];
  if (!cancelableStatuses.includes(order.status)) {
    return next(new AppError(`Cannot cancel an order with status '${order.status}'`, 400));
  }

  // Restore stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
    )
  );

  order.status = 'cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({ status: 'cancelled', note: order.cancelReason });
  await order.save();

  res.json({ success: true, message: 'Order cancelled successfully', order });
});

// ── Admin: Update order status ─────────────────────────────
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  const { status, note } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

  if (status === 'delivered') {
    order.isDelivered  = true;
    order.deliveredAt  = new Date();
    order.paymentStatus = 'paid';
    order.paidAt       = new Date();
  }

  await order.save();
  res.json({ success: true, order });
});

// ── Admin: Get all orders ──────────────────────────────────
exports.getAllOrders = catchAsync(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)   || 1);
  const limit  = Math.min(50, parseInt(req.query.limit)  || 20);
  const skip   = (page - 1) * limit;
  const filter = {};

  if (req.query.status)  filter.status = req.query.status;
  if (req.query.payment) filter.paymentStatus = req.query.payment;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, total, pages: Math.ceil(total / limit), currentPage: page });
});
