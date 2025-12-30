import { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { UserIcon, XIcon } from './Icons';

const ChatModal = ({ isOpen, onClose, ride, otherUser: initialOtherUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(initialOtherUser);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && ride) {
      // otherUser'ı ayarla
      if (initialOtherUser) {
        setOtherUser(initialOtherUser);
      } else if (user.role === 'passenger' && ride.driver) {
        setOtherUser(ride.driver);
      }
      fetchMessages();
      // Her 5 saniyede bir mesajları güncelle (daha az sıklıkla)
      const interval = setInterval(() => {
        fetchMessages();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, ride?._id, initialOtherUser, user.role]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // Sürücü ise ve otherUser varsa, passengerId ile mesajları getir
      const passengerId = user.role === 'driver' && otherUser?._id ? otherUser._id : null;
      const data = await messageService.getMessagesByRide(ride._id, passengerId);
      setMessages(data || []);
      
      // Eğer otherUser yoksa, mesajlardan bul veya ride'dan al
      if (!otherUser) {
        if (data && data.length > 0) {
          // Mesajlardan diğer kullanıcıyı bul
          const firstMessage = data[0];
          const other = firstMessage.sender._id === user._id 
            ? firstMessage.receiver 
            : firstMessage.sender;
          setOtherUser(other);
        } else if (ride.driver) {
          // Mesaj yoksa, yolcu ise sürücüyü göster
          if (user.role === 'passenger') {
            setOtherUser(ride.driver);
          }
        }
      }
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    // Eğer otherUser yoksa, yolcu ise sürücüyü alıcı olarak ayarla
    const receiverId = otherUser?._id || (user.role === 'passenger' ? ride.driver?._id : null);
    
    if (!receiverId) {
      alert('Alıcı bulunamadı');
      return;
    }

    setSending(true);
    try {
      await messageService.sendMessage({
        receiverId: receiverId,
        rideId: ride._id,
        content: newMessage.trim()
      });
      setNewMessage('');
      // Mesajları yeniden yükle
      setTimeout(() => {
        fetchMessages();
      }, 500);
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      alert(error.response?.data?.message || 'Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            {(otherUser?.profilePicture || (user.role === 'passenger' && ride.driver?.profilePicture)) ? (
              <img
                src={otherUser?.profilePicture || ride.driver?.profilePicture}
                alt={otherUser?.username || ride.driver?.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{otherUser?.username || (user.role === 'passenger' ? ride.driver?.username : 'Kullanıcı')}</h3>
              <p className="text-xs text-blue-100">
                {ride.origin} → {ride.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Henüz mesaj yok. İlk mesajı siz gönderin!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender._id === user._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {message.sender.username}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesaj yazın..."
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending || (!otherUser && user.role !== 'passenger')}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim() || (!otherUser && user.role !== 'passenger' && !ride.driver)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {sending ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;

