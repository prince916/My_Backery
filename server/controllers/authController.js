const crypto = require('crypto');
const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/error');
const { sendTokenResponse, generateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailUtils');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// ── Register ───────────────────────────────────────────────
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400));
  }

  const user = await User.create({ name, email, password, phone });

  // Send welcome / verification email
  const verifyToken = user.getEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to My Bakery — Please verify your email',
      template: 'welcome',
      data: { name: user.name, verifyUrl },
    });
  } catch {
    // Non-blocking: don't fail registration if email fails
  }

  sendTokenResponse(user, 201, res);
});

// ── Login ──────────────────────────────────────────────────
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact support.', 403));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// ── Logout ─────────────────────────────────────────────────
exports.logout = catchAsync(async (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ── Get current user ───────────────────────────────────────
exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name slug images effectivePrice');
  res.json({ success: true, user });
});

// ── Forgot password ────────────────────────────────────────
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No account found with that email address', 404));
  }

  const rawToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'My Bakery — Password Reset Request',
      template: 'resetPassword',
      data: { name: user.name, resetUrl },
    });
    res.json({ success: true, message: 'Password reset email sent. Check your inbox.' });
  } catch (err) {
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be sent. Please try again later.', 500));
  }
});

// ── Reset password ─────────────────────────────────────────
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    return next(new AppError('Reset token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// ── Update password ────────────────────────────────────────
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const { currentPassword, newPassword } = req.body;

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// ── Verify email ───────────────────────────────────────────
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerifyToken:  hashedToken,
    emailVerifyExpire: { $gt: Date.now() },
  }).select('+emailVerifyToken +emailVerifyExpire');

  if (!user) {
    return next(new AppError('Verification token is invalid or has expired', 400));
  }

  user.isVerified        = true;
  user.emailVerifyToken  = undefined;
  user.emailVerifyExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Email verified successfully!' });
});
