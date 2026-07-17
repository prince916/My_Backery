const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  phone:    { type: String, required: true },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  country:  { type: String, default: 'India' },
  isDefault:{ type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Name is required'], trim: true, maxlength: [50, 'Name max 50 chars'] },
    email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
                match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
    password: { type: String, required: [true, 'Password is required'], minlength: [8, 'Password min 8 chars'], select: false },
    phone:    { type: String, trim: true },
    avatar:   { public_id: { type: String }, url: { type: String, default: '' } },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses:     [addressSchema],
    wishlist:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isVerified:    { type: Boolean, default: false },
    isActive:      { type: Boolean, default: true },
    // Password reset
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpire:  { type: Date, select: false },
    // Email verification
    emailVerifyToken:     { type: String, select: false },
    emailVerifyExpire:    { type: Date, select: false },
    // Refresh token
    refreshToken:         { type: String, select: false },
    lastLogin:            { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return rawToken;
};

// Generate email verification token
userSchema.methods.getEmailVerifyToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return rawToken;
};

module.exports = mongoose.model('User', userSchema);
