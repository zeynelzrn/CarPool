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
    const { username, email, password, role } = req.body;

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
      role
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

module.exports = {
  register,
  login,
  getMe
};
