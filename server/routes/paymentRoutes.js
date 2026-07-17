const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/stripe/create-intent', protect, ctrl.createStripePaymentIntent);
router.post('/stripe/confirm',       protect, ctrl.confirmStripePayment);
router.post('/stripe/webhook',       express.raw({ type: 'application/json' }), ctrl.stripeWebhook);

router.post('/razorpay/create-order', protect, ctrl.createRazorpayOrder);
router.post('/razorpay/verify',       protect, ctrl.verifyRazorpayPayment);

module.exports = router;
