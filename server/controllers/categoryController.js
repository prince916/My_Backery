const Category = require('../models/Category');
const { catchAsync, AppError } = require('../middleware/error');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('productCount')
    .sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
  });
  if (!category) return next(new AppError('Category not found', 404));
  res.json({ success: true, category });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  let image;
  if (req.file) {
    const b64     = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    image = await uploadToCloudinary(dataUri, 'mybakery/categories');
  }
  const category = await Category.create({ ...req.body, image });
  res.status(201).json({ success: true, category });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  let category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));

  if (req.file) {
    if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
    const b64     = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    req.body.image = await uploadToCloudinary(dataUri, 'mybakery/categories');
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, category });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));
  if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
