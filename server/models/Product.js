const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  url:       { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name:         { type: String, required: [true, 'Product name is required'], trim: true, maxlength: [120, 'Name max 120 chars'] },
    slug:         { type: String, unique: true },
    description:  { type: String, required: [true, 'Description is required'], maxlength: [2000] },
    shortDesc:    { type: String, maxlength: [300] },
    price:        { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    discountPrice:{ type: Number, default: 0 },
    images:       { type: [imageSchema], required: true },
    category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags:         [{ type: String, trim: true }],
    ingredients:  [{ type: String, trim: true }],
    allergens:    [{ type: String, trim: true }],
    weight:       { type: String },        // e.g., "500g"
    servings:     { type: Number },
    preparationTime: { type: String },     // e.g., "2-3 days"
    shelf:        { type: String },        // e.g., "3 days"
    isFeatured:   { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isNew:        { type: Boolean, default: false },
    isAvailable:  { type: Boolean, default: true },
    stock:        { type: Number, default: 100, min: 0 },
    minOrderQty:  { type: Number, default: 1 },
    maxOrderQty:  { type: Number, default: 20 },
    numReviews:   { type: Number, default: 0 },
    ratings:      { type: Number, default: 0, min: 0, max: 5 },
    // Customization options
    customizable: { type: Boolean, default: false },
    flavors:      [{ type: String }],
    sizes:        [{ name: String, price: Number }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual: discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (this.discountPrice && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual: effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isFeatured: 1, isAvailable: 1 });
productSchema.index({ price: 1, ratings: -1 });

module.exports = mongoose.model('Product', productSchema);
