const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Yolculuk bilgisi gereklidir']
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Yolcu bilgisi gereklidir']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Bir yolcu aynı yolculuk için birden fazla rezervasyon yapamamalı
bookingSchema.index({ ride: 1, passenger: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
