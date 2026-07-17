const Stripe   = require('stripe');
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');
const { catchAsync, AppError } = require('../middleware/error');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Stripe: Create Payment Intent ─────────────────────────
exports.createStripePaymentIntent = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));
  if (order.user.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(order.totalPrice * 100), // paise/cents
    currency: 'inr',
    metadata: {
      orderId:     order._id.toString(),
      orderNumber: order.orderNumber,
      userId:      req.user._id.toString(),
    },
  });

  res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

// ── Stripe: Confirm payment ────────────────────────────────
exports.confirmStripePayment = catchAsync(async (req, res, next) => {
  const { orderId, paymentIntentId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== 'succeeded') {
    return next(new AppError('Payment not successful', 400));
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: 'paid',
      paidAt:        new Date(),
      paymentResult: {
        id:           paymentIntent.id,
        status:       paymentIntent.status,
        updateTime:   new Date().toISOString(),
        emailAddress: req.user.email,
      },
      status: 'confirmed',
      $push: { statusHistory: { status: 'confirmed', note: 'Payment received via Stripe' } },
    },
    { new: true }
  );

  res.json({ success: true, order });
});

// ── Stripe Webhook ─────────────────────────────────────────
exports.stripeWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    await Order.findByIdAndUpdate(pi.metadata.orderId, {
      paymentStatus: 'paid',
      paidAt:        new Date(),
      status:        'confirmed',
      $push: { statusHistory: { status: 'confirmed', note: 'Payment confirmed via Stripe webhook' } },
    });
  }

  res.json({ received: true });
});

// ── Razorpay: Create Order ────────────────────────────────
exports.createRazorpayOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));
  if (order.user.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));

  const razorpayOrder = await razorpay.orders.create({
    amount:   Math.round(order.totalPrice * 100),
    currency: 'INR',
    receipt:  order.orderNumber,
    notes:    { orderId: order._id.toString() },
  });

  res.json({ success: true, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount });
});

// ── Razorpay: Verify payment ───────────────────────────────
exports.verifyRazorpayPayment = catchAsync(async (req, res, next) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Verify HMAC signature
  const body       = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return next(new AppError('Payment verification failed — invalid signature', 400));
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: 'paid',
      paidAt:        new Date(),
      status:        'confirmed',
      paymentResult: { id: razorpay_payment_id, status: 'captured' },
      $push: { statusHistory: { status: 'confirmed', note: 'Payment received via Razorpay' } },
    },
    { new: true }
  );

  res.json({ success: true, order });
});
