const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:        { type: String, required: true },
  image:       { type: String },
  price:       { type: Number, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  // Customization
  flavor:      { type: String },
  size:        { type: String },
  specialNote: { type: String, maxlength: 500 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone:    { type: String, required: true },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  country:  { type: String, default: 'India' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:       [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },

    // Pricing breakdown
    itemsPrice:    { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountAmount:{ type: Number, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },

    // Coupon
    coupon:        { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode:    { type: String },

    // Payment
    paymentMethod: { type: String, enum: ['stripe', 'razorpay', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentResult: {
      id:       String,
      status:   String,
      updateTime: String,
      emailAddress: String,
    },
    paidAt: { type: Date },

    // Delivery preferences
    deliveryDate:  { type: Date },
    deliveryTime:  { type: String },    // e.g., "10:00 AM - 12:00 PM"
    specialInstructions: { type: String, maxlength: 500 },

    // Order status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status:    String,
        updatedAt: { type: Date, default: Date.now },
        note:      String,
      },
    ],
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    cancelReason:{ type: String },
  },
  { timestamps: true }
);

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `BKY-${timestamp}-${random}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
