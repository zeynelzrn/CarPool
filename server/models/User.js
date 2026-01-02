const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Kullanıcı adı gereklidir'],
    unique: true,
    trim: true,
    minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır']
  },
  email: {
    type: String,
    required: [true, 'Email gereklidir'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  role: {
    type: String,
    enum: ['driver', 'passenger'],
    required: [true, 'Rol seçimi gereklidir (driver veya passenger)']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Biyografi en fazla 500 karakter olabilir'],
    trim: true
  },
  securityQuestion: {
    type: String,
    required: [true, 'Güvenlik sorusu gereklidir'],
    trim: true
  },
  securityAnswer: {
    type: String,
    required: [true, 'Güvenlik sorusu cevabı gereklidir']
  }
}, {
  timestamps: true
});

// Şifreyi ve güvenlik cevabını kaydetmeden önce hashle
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);

  // Şifre değişmişse hashle
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Güvenlik cevabı değişmişse hashle
  if (this.isModified('securityAnswer')) {
    this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase().trim(), salt);
  }

  next();
});

// Şifre karşılaştırma methodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Güvenlik cevabı karşılaştırma methodu
userSchema.methods.compareSecurityAnswer = async function(candidateAnswer) {
  return await bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);
