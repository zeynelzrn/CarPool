const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Gönderen kullanıcı gereklidir']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Alıcı kullanıcı gereklidir']
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Yolculuk bilgisi gereklidir']
  },
  content: {
    type: String,
    required: [true, 'Mesaj içeriği gereklidir'],
    trim: true,
    maxlength: [1000, 'Mesaj en fazla 1000 karakter olabilir']
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// İndeksler - performans için
messageSchema.index({ sender: 1, receiver: 1, ride: 1 });
messageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);

