const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/userController');
const cartCtrl= require('../controllers/cartController');
const { protect, authorize } = require('../middleware/auth');
const upload  = require('../middleware/upload');

// Profile
router.get( '/profile',            protect, ctrl.getProfile);
router.put( '/profile',            protect, upload.single('avatar'), ctrl.updateProfile);

// Addresses
router.get( '/addresses',          protect, ctrl.getAddresses);
router.post('/addresses',          protect, ctrl.addAddress);
router.put( '/addresses/:addressId', protect, ctrl.updateAddress);
router.delete('/addresses/:addressId', protect, ctrl.deleteAddress);

// Wishlist
router.get( '/wishlist',           protect, ctrl.getWishlist);
router.post('/wishlist/:productId',protect, ctrl.toggleWishlist);

// Cart
router.get( '/cart',               protect, cartCtrl.getCart);
router.post('/cart',               protect, cartCtrl.addToCart);
router.put( '/cart/:itemId',       protect, cartCtrl.updateCartItem);
router.delete('/cart/:itemId',     protect, cartCtrl.removeFromCart);
router.delete('/cart',             protect, cartCtrl.clearCart);

// Admin
router.get('/',          protect, authorize('admin'), ctrl.getAllUsers);
router.get('/:id',       protect, authorize('admin'), ctrl.getUserById);
router.put('/:id/role',  protect, authorize('admin'), ctrl.updateUserRole);
router.put('/:id/deactivate', protect, authorize('admin'), ctrl.deactivateUser);

module.exports = router;
