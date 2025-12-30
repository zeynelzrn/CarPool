const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Yolculuk bilgisi gereklidir']
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Değerlendiren kullanıcı gereklidir']
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Değerlendirilen kullanıcı gereklidir']
  },
  rating: {
    type: Number,
    required: [true, 'Puan gereklidir'],
    min: [1, 'Puan en az 1 olmalıdır'],
    max: [5, 'Puan en fazla 5 olabilir']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Yorum en fazla 500 karakter olabilir']
  },
  role: {
    type: String,
    enum: ['driver', 'passenger'],
    required: [true, 'Rol gereklidir']
  }
}, {
  timestamps: true
});

// Bir kullanıcı aynı yolculuk için diğer kullanıcıya sadece bir değerlendirme yapabilir
ratingSchema.index({ ride: 1, fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);

