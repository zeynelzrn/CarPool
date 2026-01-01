const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sürücü bilgisi gereklidir']
  },
  origin: {
    type: String,
    required: [true, 'Başlangıç noktası gereklidir'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Varış noktası gereklidir'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Tarih gereklidir']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat gereklidir'],
    min: [0, 'Fiyat negatif olamaz']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Toplam koltuk sayısı gereklidir'],
    min: [1, 'En az 1 koltuk olmalıdır']
  },
  availableSeats: {
    type: Number,
    required: [true, 'Mevcut koltuk sayısı gereklidir'],
    min: [0, 'Mevcut koltuk sayısı negatif olamaz']
  },
  coordinates: {
    startLat: {
      type: Number,
      required: [true, 'Başlangıç enlem bilgisi gereklidir']
    },
    startLng: {
      type: Number,
      required: [true, 'Başlangıç boylam bilgisi gereklidir']
    },
    endLat: {
      type: Number,
      required: [true, 'Bitiş enlem bilgisi gereklidir']
    },
    endLng: {
      type: Number,
      required: [true, 'Bitiş boylam bilgisi gereklidir']
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  carDetails: {
    brand: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      min: [1900, 'Geçerli bir yıl giriniz'],
      max: [new Date().getFullYear() + 1, 'Gelecek yıl olamaz']
    },
    color: {
      type: String,
      trim: true
    },
    plate: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ride', rideSchema);
