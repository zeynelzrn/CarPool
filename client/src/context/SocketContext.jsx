import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Socket URL: API URL'den /api kısmını çıkararak kök adresi al
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5001';

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
  const socketRef = useRef(null);
  const processedNotificationsRef = useRef(new Map()); // ID + Message bazlı duplicate kontrolü

  // === GÜÇLENDİRİLMİŞ DEDUPLICATION HELPER ===
  const isDuplicateNotification = (message, type, bookingId = null) => {
    // Birden fazla key oluştur: message bazlı + booking ID bazlı
    const messageKey = `${type}:${message}`;
    const bookingKey = bookingId ? `booking:${bookingId}:${type}` : null;
    const now = Date.now();

    // Eski kayıtları temizle (5 saniyeden eski)
    for (const [key, timestamp] of processedNotificationsRef.current.entries()) {
      if (now - timestamp > 5000) {
        processedNotificationsRef.current.delete(key);
      }
    }

    // Message bazlı kontrol
    if (processedNotificationsRef.current.has(messageKey)) {
      console.log('🚫 Duplicate bildirim engellendi (message):', messageKey);
      return true;
    }

    // Booking ID bazlı kontrol
    if (bookingKey && processedNotificationsRef.current.has(bookingKey)) {
      console.log('🚫 Duplicate bildirim engellendi (bookingId):', bookingKey);
      return true;
    }

    // Yeni bildirimi kaydet
    processedNotificationsRef.current.set(messageKey, now);
    if (bookingKey) {
      processedNotificationsRef.current.set(bookingKey, now);
    }

    return false;
  };

  // === MANUEL BİLDİRİM EKLEME FONKSİYONU ===
  const addNotification = useCallback((notification) => {
    const message = notification.message || notification.text;
    const type = notification.type || 'info';

    if (isDuplicateNotification(message, type)) {
      return;
    }

    setNotifications(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: type,
      message: message,
      data: notification.data,
      link: notification.link,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    // Eğer zaten bağlı bir socket varsa, tekrar oluşturma
    if (socketRef.current) {
      return;
    }

    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketRef.current = newSocket;

      // === EVENT HANDLERS ===
      const handleConnect = () => {
        console.log('Socket.io bağlandı, userId:', user._id);
        newSocket.emit('addNewUser', user._id);
      };

      const handleDisconnect = () => {
        console.log('Socket.io bağlantısı kesildi');
      };

      const handleConnectError = (error) => {
        console.error('Socket.io bağlantı hatası:', error);
      };

      const handleNewBookingRequest = (data) => {
        console.log('📥 Yeni rezervasyon isteği:', data);
        const message = data.message;
        const bookingId = data.booking?._id;

        // GÜÇLENDİRİLMİŞ Deduplication kontrolü (message + booking ID)
        if (isDuplicateNotification(message, 'booking-request', bookingId)) {
          return;
        }

        setNotifications(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: 'booking-request',
          message: message,
          data: data.booking,
          timestamp: new Date()
        }]);
      };

      const handleBookingStatusUpdated = (data) => {
        console.log('📥 Rezervasyon durumu güncellendi:', data);
        const message = data.message;
        const bookingId = data.booking?._id;

        // GÜÇLENDİRİLMİŞ Deduplication kontrolü (message + booking ID)
        if (isDuplicateNotification(message, 'booking-status', bookingId)) {
          return;
        }

        setNotifications(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: 'booking-status',
          message: message,
          data: data.booking,
          timestamp: new Date()
        }]);
      };

      const handleNewRideCreated = (data) => {
        console.log('Yeni yolculuk ilanı:', data);
        const message = data.message;

        // Deduplication kontrolü
        if (isDuplicateNotification(message, 'new-ride')) {
          return;
        }

        setNotifications(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: 'new-ride',
          message: message,
          data: data.ride,
          timestamp: new Date()
        }]);
      };

      const handleNewMessage = (message) => {
        // Sadece log bas, bildirim oluşturma
        // Bildirim 'notification' eventi üzerinden geliyor
        console.log('Yeni mesaj alındı:', message);
      };

      const handleNotification = (data) => {
        console.log('Bildirim alındı:', data);
        const newMessage = data.text || data.message;
        const type = data.type || 'info';

        // Deduplication kontrolü
        if (isDuplicateNotification(newMessage, type)) {
          return;
        }

        setNotifications(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: type,
          message: newMessage,
          data: data,
          link: data.link,
          timestamp: new Date()
        }]);
      };

      // === ÖNCE ESKİ LISTENER'LARI TEMİZLE (garanti için) ===
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('connect_error', handleConnectError);
      newSocket.off('new-booking-request', handleNewBookingRequest);
      newSocket.off('booking-status-updated', handleBookingStatusUpdated);
      newSocket.off('new-ride-created', handleNewRideCreated);
      newSocket.off('new-message', handleNewMessage);
      newSocket.off('notification', handleNotification);

      // === SONRA YENİ LISTENER'LARI EKLE ===
      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('connect_error', handleConnectError);
      newSocket.on('new-booking-request', handleNewBookingRequest);
      newSocket.on('booking-status-updated', handleBookingStatusUpdated);
      newSocket.on('new-ride-created', handleNewRideCreated);
      newSocket.on('new-message', handleNewMessage);
      newSocket.on('notification', handleNotification);

      setSocket(newSocket);

      // === CLEANUP FUNCTION ===
      return () => {
        console.log('Socket cleanup yapılıyor...');
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('connect_error', handleConnectError);
        newSocket.off('new-booking-request', handleNewBookingRequest);
        newSocket.off('booking-status-updated', handleBookingStatusUpdated);
        newSocket.off('new-ride-created', handleNewRideCreated);
        newSocket.off('new-message', handleNewMessage);
        newSocket.off('notification', handleNotification);
        newSocket.close();
        socketRef.current = null;
      };
    } else {
      // Kullanıcı çıkış yaptıysa socket'i kapat
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
      }
      setNotifications([]);
    }
  }, [isAuthenticated, user?._id]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const joinRideRoom = useCallback((rideId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-ride-room', rideId);
    }
  }, []);

  const value = {
    socket,
    notifications,
    addNotification,
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
