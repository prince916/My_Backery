const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const upload  = require('../middleware/upload');

router.post('/',              protect, upload.array('images', 3), ctrl.createReview);
router.get( '/product/:productId',   ctrl.getProductReviews);
router.put( '/:id',           protect, ctrl.updateReview);
router.delete('/:id',         protect, ctrl.deleteReview);

// Admin
router.get('/',               protect, authorize('admin'), ctrl.getAllReviews);
router.put('/:id/approval',   protect, authorize('admin'), ctrl.toggleReviewApproval);

module.exports = router;
