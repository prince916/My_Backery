const Product = require('../models/Product');
const Review  = require('../models/Review');
const { catchAsync, AppError } = require('../middleware/error');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Helper: build filter query from request params
const buildQuery = (query) => {
  const filter = { isAvailable: true };

  if (query.category)   filter.category = query.category;
  if (query.isFeatured) filter.isFeatured = true;
  if (query.isBestseller) filter.isBestseller = true;
  if (query.isNew)      filter.isNew = true;

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.rating) {
    filter.ratings = { $gte: Number(query.rating) };
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

// ── Get all products (with pagination, filter, sort) ───────
exports.getProducts = catchAsync(async (req, res) => {
  const filter = buildQuery(req.query);

  // Sort
  let sort = { createdAt: -1 };
  if (req.query.sort) {
    const sortMap = {
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      'rating':     { ratings: -1 },
      'newest':     { createdAt: -1 },
      'popular':    { numReviews: -1 },
    };
    sort = sortMap[req.query.sort] || sort;
  }

  // Pagination
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);
  const skip  = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count:       products.length,
    total,
    pages:       Math.ceil(total / limit),
    currentPage: page,
    products,
  });
});

// ── Get single product by slug or id ──────────────────────
exports.getProduct = catchAsync(async (req, res, next) => {
  const { idOrSlug } = req.params;
  const product = await Product.findOne(
    idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug }
  ).populate('category', 'name slug');

  if (!product) return next(new AppError('Product not found', 404));

  // Fetch associated reviews
  const reviews = await Review.find({ product: product._id, isApproved: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ success: true, product, reviews });
});

// ── Get featured / bestseller / new products ──────────────
exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const [featured, bestsellers, newArrivals] = await Promise.all([
    Product.find({ isFeatured: true, isAvailable: true }).populate('category', 'name').limit(8),
    Product.find({ isBestseller: true, isAvailable: true }).populate('category', 'name').limit(8),
    Product.find({ isNew: true, isAvailable: true }).populate('category', 'name').limit(8),
  ]);
  res.json({ success: true, featured, bestsellers, newArrivals });
});

// ── Admin: Create product ──────────────────────────────────
exports.createProduct = catchAsync(async (req, res, next) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return next(new AppError('At least one product image is required', 400));
  }

  // Upload images to Cloudinary
  const imageUploadPromises = files.map((file) => {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataUri = `data:${file.mimetype};base64,${b64}`;
    return uploadToCloudinary(dataUri, 'mybakery/products');
  });
  const uploadedImages = await Promise.all(imageUploadPromises);

  const product = await Product.create({ ...req.body, images: uploadedImages });
  res.status(201).json({ success: true, product });
});

// ── Admin: Update product ──────────────────────────────────
exports.updateProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  // Upload new images if provided
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    await Promise.all(product.images.map((img) => deleteFromCloudinary(img.public_id)));

    const uploadedImages = await Promise.all(
      req.files.map((file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataUri = `data:${file.mimetype};base64,${b64}`;
        return uploadToCloudinary(dataUri, 'mybakery/products');
      })
    );
    req.body.images = uploadedImages;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, product });
});

// ── Admin: Delete product ──────────────────────────────────
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  await Promise.all(product.images.map((img) => deleteFromCloudinary(img.public_id)));
  await product.deleteOne();

  res.json({ success: true, message: 'Product deleted successfully' });
});

// ── Get related products ───────────────────────────────────
exports.getRelatedProducts = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isAvailable: true,
  }).limit(4);

  res.json({ success: true, products: related });
});
