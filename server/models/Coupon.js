const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    description:   { type: String },
    discountType:  { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount:{ type: Number, default: 0 },
    maxDiscount:   { type: Number },        // Max cap for percentage discounts
    usageLimit:    { type: Number, default: null }, // null = unlimited
    usedCount:     { type: Number, default: 0 },
    userUsageLimit:{ type: Number, default: 1 },   // Per user
    usedBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validFrom:     { type: Date, required: true },
    validTo:       { type: Date, required: true },
    isActive:      { type: Boolean, default: true },
    applicableProducts:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  },
  { timestamps: true }
);

// Virtual: is currently valid
couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validTo &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

module.exports = mongoose.model('Coupon', couponSchema);
