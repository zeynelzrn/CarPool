const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getUserById,
  getSecurityQuestion,
  resetPasswordWithAnswer
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/user/:userId', getUserById);

// Şifremi Unuttum - Güvenlik Sorusu
router.post('/get-security-question', getSecurityQuestion);
router.post('/reset-password-security', resetPasswordWithAnswer);

module.exports = router;
