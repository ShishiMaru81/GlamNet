const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
  appleLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/google', googleLogin);
router.post('/apple', appleLogin);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.get('/verifyemail/:token', verifyEmail);

module.exports = router;


