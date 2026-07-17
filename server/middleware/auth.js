const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./error');

/**
 * Protect routes — verifies JWT from Authorization header or cookie
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired, please login again', 401));
    }
    next(err);
  }
};

/**
 * Restrict access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role '${req.user.role}' is not authorized to access this route`, 403));
    }
    next();
  };
};

/**
 * Generate JWT access token
 */
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

/**
 * Send token response with cookie
 */
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = exports.generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const userData = {
    _id:       user._id,
    name:      user.name,
    email:     user.email,
    role:      user.role,
    avatar:    user.avatar,
    phone:     user.phone,
    isVerified:user.isVerified,
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({ success: true, token, user: userData });
};
