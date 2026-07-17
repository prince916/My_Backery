const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/error');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// ── Get my profile ─────────────────────────────────────────
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name slug images effectivePrice ratings');
  res.json({ success: true, user });
});

// ── Update profile ─────────────────────────────────────────
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name)  updates.name  = name;
  if (phone) updates.phone = phone;

  // Avatar upload
  if (req.file) {
    const b64     = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    // Delete old avatar from Cloudinary
    const user = await User.findById(req.user.id);
    if (user.avatar?.public_id) await deleteFromCloudinary(user.avatar.public_id);

    const uploaded = await uploadToCloudinary(dataUri, 'mybakery/avatars');
    updates.avatar = uploaded;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

// ── Addresses ──────────────────────────────────────────────
exports.getAddresses = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('addresses');
  res.json({ success: true, addresses: user.addresses });
});

exports.addAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return next(new AppError('Address not found', 404));

  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }

  Object.assign(addr, req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return next(new AppError('Address not found', 404));

  addr.deleteOne();
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// ── Wishlist ───────────────────────────────────────────────
exports.toggleWishlist = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  const productId = req.params.productId;

  const idx = user.wishlist.findIndex((id) => id.toString() === productId);
  let action;
  if (idx === -1) {
    user.wishlist.push(productId);
    action = 'added';
  } else {
    user.wishlist.splice(idx, 1);
    action = 'removed';
  }

  await user.save();
  res.json({ success: true, action, wishlist: user.wishlist });
});

exports.getWishlist = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name slug images effectivePrice ratings isFeatured');
  res.json({ success: true, wishlist: user.wishlist });
});

// ── Admin: Get all users ───────────────────────────────────
exports.getAllUsers = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;
  const filter = {};
  if (req.query.role)   filter.role = req.query.role;
  if (req.query.search) filter.$or = [
    { name: { $regex: req.query.search, $options: 'i' } },
    { email:{ $regex: req.query.search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, total, pages: Math.ceil(total / limit), currentPage: page });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return next(new AppError('User not found', 404));
  res.json({ success: true, user });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  ).select('-password');
  if (!user) return next(new AppError('User not found', 404));
  res.json({ success: true, user });
});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select('-password');
  if (!user) return next(new AppError('User not found', 404));
  res.json({ success: true, message: 'User deactivated', user });
});
