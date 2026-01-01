const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

// Online kullanıcıları tutan Map: userId -> socketId
const onlineUsers = new Map();

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        process.env.CLIENT_URL
      ].filter(Boolean),
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
    console.log(`✅ Kullanıcı bağlandı: ${socket.user.username} (${socket.userId})`);

    // Kullanıcıyı kendi room'una ekle (kullanıcı ID'si ile)
    socket.join(`user_${socket.userId}`);

    // addNewUser eventi - kullanıcıyı online listesine ekle
    socket.on('addNewUser', (userId) => {
      if (userId) {
        const userIdStr = userId.toString();
        onlineUsers.set(userIdStr, socket.id);
        console.log(`👤 Kullanıcı online listeye eklendi: ${userIdStr} -> ${socket.id}`);
        console.log(`📊 Online kullanıcı sayısı: ${onlineUsers.size}`);
      }
    });

    // Tüm kullanıcılar ride room'larına katılabilir (mesajlaşma için)
    socket.on('join-ride-room', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`🚗 Kullanıcı ${socket.user.username} ride_${rideId} room'una katıldı`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Kullanıcı ayrıldı: ${socket.user.username}`);
      // Online listesinden kaldır
      onlineUsers.delete(socket.userId);
      console.log(`📊 Online kullanıcı sayısı: ${onlineUsers.size}`);
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

// Belirli bir kullanıcının socket ID'sini döndür
const getReceiverSocketId = (userId) => {
  if (!userId) return null;
  const userIdStr = userId.toString();
  const socketId = onlineUsers.get(userIdStr);
  console.log(`🔍 getReceiverSocketId(${userIdStr}): ${socketId || 'OFFLINE'}`);
  return socketId;
};

// Online kullanıcı listesini döndür
const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = {
  initializeSocket,
  getIO,
  getReceiverSocketId,
  getOnlineUsers
};
