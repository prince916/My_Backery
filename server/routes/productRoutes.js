const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload   = require('../middleware/upload');

// Public routes
router.get('/',                   ctrl.getProducts);
router.get('/featured',           ctrl.getFeaturedProducts);
router.get('/:idOrSlug',          ctrl.getProduct);
router.get('/:id/related',        ctrl.getRelatedProducts);

// Admin routes
router.post(  '/',     protect, authorize('admin'), upload.array('images', 5), ctrl.createProduct);
router.put(   '/:id',  protect, authorize('admin'), upload.array('images', 5), ctrl.updateProduct);
router.delete('/:id',  protect, authorize('admin'), ctrl.deleteProduct);

module.exports = router;
