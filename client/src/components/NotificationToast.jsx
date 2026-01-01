import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const NotificationToast = () => {
  const { notifications, removeNotification } = useSocket();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const prevNotificationsLength = useRef(notifications.length);

  // Bildirim sesi
  useEffect(() => {
    if (notifications.length > prevNotificationsLength.current) {
      // Yeni bildirim geldi, ses çal
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleU1mZ5/V1qVtIwg4jNHVpo5sZJHBzKKCURwKWZnM0ZyBZ12LucfRv5NoMw8gfafQwYmBgJ7J3M6oXh4fZY+7up6Kd3Cf0dq0eg8fYI+xsJiPiH6k2drAghMjUoOqo5CQhYOr3t3GkygWNHagoZePh4ep4t/OoTwZI2eWnJeSiYaq6uXdszwHAF2WmpaVko+s8PDo1VEAC1KOn5mYmJWz+/v58GsJAD+Dn52dnJ299/j39XIEAD1/nJ6gnqLE+/r2734IAjl4l52lqarN/fn18YYKBS1sipmpsL/b//v28pAWDCFfepehrrfU9/b18Z4kExZSa4OWoKa+1vH09vKrNRsMQ1x3iZSdqLrM5vL08L1KKBM1UGZ4goqSmKS1xNnn8PPNYDsjLEJYZnF5gYqSmau+0eLz9+BzTTQkMUJRXWZtdX6Hi5artMXV5/f+7IdhQDEpNEJNVl1lanF4f4WMlaGsucfY6/z/');
        }
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {});
      } catch (e) {
        // Ses çalınamazsa sessizce devam et
      }
    }
    prevNotificationsLength.current = notifications.length;
  }, [notifications.length]);

  // Auto-dismiss: 4 saniye sonra bildirim otomatik kapansın
  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 4000);

      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  const handleNotificationClick = (notification) => {
    removeNotification(notification.id);

    // Önce link varsa onu kullan
    if (notification.link) {
      navigate(notification.link);
      return;
    }

    switch (notification.type) {
      case 'booking-request':
      case 'booking':
        navigate('/my-rides');
        break;
      case 'booking-status':
      case 'status':
        navigate('/my-bookings');
        break;
      case 'new-ride':
        navigate('/rides');
        break;
      case 'message':
        if (notification.data?.ride?._id) {
          navigate(`/rides/${notification.data.ride._id}`);
        } else {
          navigate('/rides');
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'booking-request':
      case 'booking':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'booking-status':
      case 'status':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'new-ride':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'message':
        return 'Yeni Mesaj';
      case 'booking-request':
      case 'booking':
        return 'Rezervasyon Talebi';
      case 'booking-status':
      case 'status':
        return 'Rezervasyon Durumu';
      case 'new-ride':
        return 'Yeni Yolculuk';
      default:
        return 'Bildirim';
    }
  };

  const getNotificationColors = (type) => {
    switch (type) {
      case 'message':
        return 'bg-purple-500';
      case 'booking-request':
      case 'booking':
        return 'bg-blue-500';
      case 'booking-status':
      case 'status':
        return 'bg-emerald-500';
      case 'new-ride':
        return 'bg-amber-500';
      default:
        return 'bg-[#004225]';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 3).map((notification, index) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className="pointer-events-auto bg-white rounded-2xl shadow-2xl overflow-hidden cursor-pointer
                     transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl
                     animate-slide-in-right border border-gray-100"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'backwards'
          }}
        >
          {/* Üst Renk Barı */}
          <div className={`h-1 ${getNotificationColors(notification.type)}`}></div>

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* İkon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${getNotificationColors(notification.type)}
                              flex items-center justify-center text-white shadow-lg`}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    {getNotificationTitle(notification.type)}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-[#004225] font-medium mt-2 flex items-center gap-1">
                  <span>Detaylar için tıklayın</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </div>

              {/* Kapat Butonu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100
                           flex items-center justify-center text-gray-400 hover:text-red-500
                           transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar - Auto dismiss göstergesi */}
          <div className="h-1 bg-gray-100">
            <div
              className={`h-full ${getNotificationColors(notification.type)} animate-shrink-width`}
              style={{ animationDuration: '4s' }}
            ></div>
          </div>
        </div>
      ))}

      {/* Fazla bildirim varsa göster */}
      {notifications.length > 3 && (
        <div className="pointer-events-auto text-center">
          <span className="inline-block bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full">
            +{notifications.length - 3} bildirim daha
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationToast;
