const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı header'dan al
      token = req.headers.authorization.split(' ')[1];

      // Token'ı verify et
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı bul ve request'e ekle (şifre olmadan)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      return res.status(401).json({ message: 'Yetkisiz erişim, token geçersiz' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Yetkisiz erişim, token bulunamadı' });
  }
};

// Sadece sürücülerin erişebileceği endpoint'ler için
const authorizeDriver = (req, res, next) => {
  if (req.user && req.user.role === 'driver') {
    next();
  } else {
    return res.status(403).json({ message: 'Bu işlem için sürücü yetkisi gereklidir' });
  }
};

// Sadece yolcuların erişebileceği endpoint'ler için
const authorizePassenger = (req, res, next) => {
  if (req.user && req.user.role === 'passenger') {
    next();
  } else {
    return res.status(403).json({ message: 'Bu işlem için yolcu yetkisi gereklidir' });
  }
};

module.exports = { protect, authorizeDriver, authorizePassenger };
