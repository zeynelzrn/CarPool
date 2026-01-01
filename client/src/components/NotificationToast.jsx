import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const NotificationToast = () => {
  const { notifications, removeNotification } = useSocket();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    removeNotification(notification.id);
    
    if (notification.type === 'booking-request' || notification.type === 'booking-status') {
      navigate('/my-rides');
    } else if (notification.type === 'new-ride') {
      navigate('/rides');
    } else if (notification.type === 'message') {
      if (notification.data?.ride?._id) {
        navigate(`/rides/${notification.data.ride._id}`);
      }
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all animate-slide-in-right"
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              notification.type === 'booking-request' || notification.type === 'booking-status' 
                ? 'bg-blue-100' 
                : notification.type === 'new-ride'
                ? 'bg-green-100'
                : 'bg-purple-100'
            }`}>
              {notification.type === 'message' && '💬'}
              {notification.type === 'booking-request' && '📅'}
              {notification.type === 'booking-status' && '✅'}
              {notification.type === 'new-ride' && '🚗'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;

