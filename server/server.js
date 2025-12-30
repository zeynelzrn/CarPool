require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// MongoDB bağlantısı
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'Carpool API - Araç Paylaşım Uygulaması' });
});

// Hata yakalama middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
