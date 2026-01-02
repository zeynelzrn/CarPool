const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Token oluştur
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Kullanıcı kayıt
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, role, securityQuestion, securityAnswer } = req.body;

    // Güvenlik sorusu ve cevabı kontrolü
    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({
        message: 'Güvenlik sorusu ve cevabı gereklidir'
      });
    }

    // Kullanıcı zaten var mı kontrol et
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        message: 'Bu email veya kullanıcı adı zaten kullanılıyor'
      });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password,
      role,
      securityQuestion,
      securityAnswer
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Geçersiz kullanıcı bilgileri' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcı profili
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Profil güncelle
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, phone, bio, profilePicture } = req.body;

    // Kullanıcı adı değiştiriliyorsa, başka birisi kullanıyor mu kontrol et
    if (username) {
      const usernameExists = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      
      if (usernameExists) {
        return res.status(400).json({ 
          message: 'Bu kullanıcı adı zaten kullanılıyor' 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(username && { username }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(profilePicture !== undefined && { profilePicture }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcı bilgisi getir (ID ile)
// @route   GET /api/auth/user/:userId
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get security question
// @route   POST /api/auth/get-security-question
// @access  Public
const getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    res.json({
      userId: user._id,
      securityQuestion: user.securityQuestion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password with security answer
// @route   POST /api/auth/reset-password-security
// @access  Public
const resetPasswordWithAnswer = async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({
        message: 'Email, security answer, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify security answer
    const isAnswerCorrect = await user.compareSecurityAnswer(securityAnswer);

    if (!isAnswerCorrect) {
      return res.status(401).json({ message: 'Security answer is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Your password has been updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getUserById,
  getSecurityQuestion,
  resetPasswordWithAnswer
};
