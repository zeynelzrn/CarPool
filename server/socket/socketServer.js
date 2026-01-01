const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token gerekli'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: Kullanıcı bulunamadı'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Geçersiz token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Kullanıcı bağlandı: ${socket.user.username} (${socket.userId})`);

    // Kullanıcıyı kendi room'una ekle (kullanıcı ID'si ile)
    socket.join(`user_${socket.userId}`);

    // Tüm kullanıcılar ride room'larına katılabilir (mesajlaşma için)
    socket.on('join-ride-room', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`Kullanıcı ${socket.user.username} ride_${rideId} room'una katıldı`);
    });

    socket.on('disconnect', () => {
      console.log(`Kullanıcı ayrıldı: ${socket.user.username}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io başlatılmamış!');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};

