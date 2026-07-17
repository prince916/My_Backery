const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const upload  = require('../middleware/upload');

router.get( '/',     ctrl.getCategories);
router.get( '/:id',  ctrl.getCategory);
router.post('/',     protect, authorize('admin'), upload.single('image'), ctrl.createCategory);
router.put( '/:id',  protect, authorize('admin'), upload.single('image'), ctrl.updateCategory);
router.delete('/:id',protect, authorize('admin'), ctrl.deleteCategory);

module.exports = router;
