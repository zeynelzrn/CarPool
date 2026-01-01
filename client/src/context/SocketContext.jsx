import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      
      const newSocket = io('http://localhost:5001', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket.io bağlandı');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.io bağlantısı kesildi');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.io bağlantı hatası:', error);
      });

      // Bildirimler için event listener'lar
      newSocket.on('new-booking-request', (data) => {
        console.log('Yeni rezervasyon isteği:', data);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'booking-request',
          message: data.message,
          data: data.booking,
          timestamp: new Date()
        }]);
      });

      newSocket.on('booking-status-updated', (data) => {
        console.log('Rezervasyon durumu güncellendi:', data);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'booking-status',
          message: data.message,
          data: data.booking,
          timestamp: new Date()
        }]);
      });

      newSocket.on('new-ride-created', (data) => {
        console.log('Yeni yolculuk ilanı:', data);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'new-ride',
          message: data.message,
          data: data.ride,
          timestamp: new Date()
        }]);
      });

      newSocket.on('new-message', (message) => {
        console.log('Yeni mesaj alındı:', message);
        
        // Sadece alıcı ise bildirim göster (kendi gönderdiğimiz mesajlar için bildirim gösterme)
        const senderId = message.sender?._id || message.sender;
        const receiverId = message.receiver?._id || message.receiver;
        const userId = user._id;
        
        // ID'leri string'e çevir
        const senderIdStr = senderId?.toString();
        const receiverIdStr = receiverId?.toString();
        const userIdStr = userId?.toString();
        
        console.log('Mesaj ID karşılaştırması:', {
          senderIdStr,
          receiverIdStr,
          userIdStr,
          isReceiver: receiverIdStr === userIdStr,
          isNotSender: senderIdStr !== userIdStr
        });
        
        // Eğer mesaj bize gönderildiyse (biz receiver isek) bildirim göster
        if (receiverIdStr === userIdStr && senderIdStr !== userIdStr) {
          const senderName = message.sender?.username || 'Birisi';
          console.log('Bildirim gösteriliyor:', senderName);
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'message',
            message: `${senderName}: ${message.content}`,
            data: message,
            timestamp: new Date()
          }]);
        } else {
          console.log('Bildirim gösterilmedi - mesaj bize gönderilmemiş veya biz gönderdik');
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setNotifications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?._id]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const joinRideRoom = (rideId) => {
    if (socket) {
      socket.emit('join-ride-room', rideId);
    }
  };

  const value = {
    socket,
    notifications,
    removeNotification,
    clearNotifications,
    joinRideRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

