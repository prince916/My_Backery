const Cart    = require('../models/Cart');
const Product = require('../models/Product');
const { catchAsync, AppError } = require('../middleware/error');

// ── Get cart ───────────────────────────────────────────────
exports.getCart = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images isAvailable stock');
  if (!cart) return res.json({ success: true, cart: { items: [], subtotal: 0, totalItems: 0 } });
  res.json({ success: true, cart });
});

// ── Add to cart ────────────────────────────────────────────
exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, flavor, size, specialNote } = req.body;

  const product = await Product.findById(productId);
  if (!product)         return next(new AppError('Product not found', 404));
  if (!product.isAvailable) return next(new AppError('Product is unavailable', 400));
  if (product.stock < quantity) return next(new AppError('Insufficient stock', 400));

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user:  req.user._id,
      items: [{ product: productId, quantity, price, flavor, size, specialNote }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.flavor === flavor && item.size === size
    );

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, product.maxOrderQty || 20);
      existingItem.price    = price;
    } else {
      cart.items.push({ product: productId, quantity, price, flavor, size, specialNote });
    }

    await cart.save();
  }

  await cart.populate('items.product', 'name images isAvailable stock');
  res.json({ success: true, cart });
});

// ── Update cart item ───────────────────────────────────────
exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));

  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Cart item not found', 404));

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name images isAvailable stock');
  res.json({ success: true, cart });
});

// ── Remove from cart ───────────────────────────────────────
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));

  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Cart item not found', 404));

  item.deleteOne();
  await cart.save();
  res.json({ success: true, message: 'Item removed from cart', cart });
});

// ── Clear cart ─────────────────────────────────────────────
exports.clearCart = catchAsync(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, couponCode: null });
  res.json({ success: true, message: 'Cart cleared' });
});
