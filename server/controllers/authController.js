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
    const { username, phone, bio, profilePicture, removeProfilePicture } = req.body;

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

    // Güncelleme objesi
    const updateData = {
      ...(username && { username }),
      ...(phone !== undefined && { phone }),
      ...(bio !== undefined && { bio }),
    };

    // Fotoğraf mantığı:
    // 1. removeProfilePicture === true ise fotoğrafı sil (boş string yap)
    // 2. profilePicture varsa yeni fotoğrafı kaydet
    // 3. Hiçbiri değilse mevcut fotoğrafı koru (updateData'ya ekleme)
    if (removeProfilePicture === true) {
      updateData.profilePicture = ''; // Fotoğrafı kaldır
    } else if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture; // Yeni fotoğraf
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
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

    // ============== VERİTABANI RÖNTGENİ (DEBUG) ==============
    const allUsers = await User.find({}, 'email');
    console.log('');
    console.log('=============== VERİTABANI RÖNTGENİ ===============');
    console.log('📧 Aranan Email (raw):', JSON.stringify(req.body.email));
    console.log('📧 Aranan Email (trim+lower):', email ? email.trim().toLowerCase() : 'N/A');
    console.log('📋 DB\'deki TOPLAM Kullanıcı Sayısı:', allUsers.length);
    console.log('📋 DB\'deki TÜM Mailler:', allUsers.map(u => u.email));
    console.log('===================================================');
    console.log('');
    // =========================================================

    if (!email) {
      console.log('❌ Email not provided');
      return res.status(400).json({ message: 'Email address is required' });
    }

    // Email'i temizle ve küçük harfe çevir
    const cleanEmail = email.trim().toLowerCase();
    console.log('🔍 Searching for email:', cleanEmail);

    // Önce tam eşleşme dene
    let user = await User.findOne({ email: cleanEmail });
    console.log('🔎 Tam eşleşme sonucu:', user ? 'BULUNDU' : 'BULUNAMADI');

    // Bulunamazsa regex ile dene (boşluk/whitespace toleransı)
    if (!user) {
      console.log('⚠️ Exact match not found, trying regex search...');
      user = await User.findOne({
        email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      console.log('🔎 Regex eşleşme sonucu:', user ? 'BULUNDU' : 'BULUNAMADI');
    }

    if (!user) {
      console.log('❌ User not found in database for email:', cleanEmail);
      console.log('💡 İpucu: Yukarıdaki mail listesinde aranan mail var mı kontrol edin!');
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    console.log('✅ User found:', user.email, '| ID:', user._id);

    // Security question kontrolü
    if (!user.securityQuestion) {
      console.log('⚠️ Security question not set for user:', user.email);
      return res.status(400).json({ message: 'Security question not set for this account' });
    }

    console.log('✅ Security question found, returning to client');
    res.json({
      userId: user._id,
      securityQuestion: user.securityQuestion
    });
  } catch (error) {
    console.error('❌ getSecurityQuestion error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password with security answer
// @route   POST /api/auth/reset-password-security
// @access  Public
const resetPasswordWithAnswer = async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    console.log('🔑 Password reset request received for:', email);

    if (!email || !securityAnswer || !newPassword) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        message: 'Email, security answer, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters'
      });
    }

    // Email'i temizle ve küçük harfe çevir
    const cleanEmail = email.trim().toLowerCase();
    console.log('🔍 Searching for email:', cleanEmail);

    // Önce tam eşleşme dene
    let user = await User.findOne({ email: cleanEmail });

    // Bulunamazsa regex ile dene
    if (!user) {
      console.log('⚠️ Exact match not found, trying regex search...');
      user = await User.findOne({
        email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }

    if (!user) {
      console.log('❌ User not found in database for email:', cleanEmail);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Verify security answer
    const isAnswerCorrect = await user.compareSecurityAnswer(securityAnswer);

    if (!isAnswerCorrect) {
      console.log('❌ Security answer incorrect for user:', user.email);
      return res.status(401).json({ message: 'Security answer is incorrect' });
    }

    console.log('✅ Security answer verified for:', user.email);

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password updated successfully for:', user.email);
    res.json({ message: 'Your password has been updated successfully' });
  } catch (error) {
    console.error('❌ resetPasswordWithAnswer error:', error.message);
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
