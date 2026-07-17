const express  = require('express');
const router   = express.Router();
const auth     = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',         auth.register);
router.post('/login',            auth.login);
router.post('/logout',           protect, auth.logout);
router.get( '/me',               protect, auth.getMe);
router.put( '/update-password',  protect, auth.updatePassword);
router.post('/forgot-password',  auth.forgotPassword);
router.put( '/reset-password/:token', auth.resetPassword);
router.get( '/verify-email/:token',   auth.verifyEmail);

module.exports = router;
