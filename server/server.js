require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeSocket } = require('./socket/socketServer');

// Route imports
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const messageRoutes = require('./routes/messageRoutes');

// MongoDB bağlantısı
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io initialization
initializeSocket(server);

// Middleware - CORS (Tüm origin'lere izin ver)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser limitleri - Profil fotoğrafı (Base64) için 50MB'a kadar izin ver
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/messages', messageRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'Carpool API - Araç Paylaşım Uygulaması' });
});

// Hata yakalama middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  // Payload Too Large hatası (dosya boyutu aşıldı)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'File size is too large. Maximum allowed size is 50MB.',
      error: 'PAYLOAD_TOO_LARGE'
    });
  }

  // JSON parse hatası
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid request format',
      error: 'INVALID_JSON'
    });
  }

  // Genel sunucu hatası
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
