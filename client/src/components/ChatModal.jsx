import { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { UserIcon, XIcon } from './Icons';

const ChatModal = ({ isOpen, onClose, ride, otherUser: initialOtherUser }) => {
  const { user } = useAuth();
  const { socket, joinRideRoom } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(initialOtherUser);
  const messagesEndRef = useRef(null);

  // otherUser'ı ayarla ve mesajları yükle
  useEffect(() => {
    if (isOpen && ride) {
      let currentOtherUser = initialOtherUser;
      
      if (!currentOtherUser && user.role === 'passenger' && ride.driver) {
        currentOtherUser = ride.driver;
        setOtherUser(currentOtherUser);
      } else if (initialOtherUser) {
        setOtherUser(initialOtherUser);
      }
      
      // Ride room'una katıl
      if (socket && ride._id) {
        joinRideRoom(ride._id);
      }
    }
  }, [isOpen, initialOtherUser, ride, user.role, socket, joinRideRoom]);

  // Mesajları yükle
  useEffect(() => {
    if (isOpen && ride && ride._id) {
      const loadMessages = async () => {
        try {
          setLoading(true);
          const passengerId = user.role === 'driver' && otherUser?._id ? otherUser._id : null;
          const data = await messageService.getMessagesByRide(ride._id, passengerId);
          setMessages(data || []);
          
          // Eğer otherUser yoksa, mesajlardan bul
          if (!otherUser && data && data.length > 0) {
            const firstMessage = data[0];
            const other = firstMessage.sender._id === user._id 
              ? firstMessage.receiver 
              : firstMessage.sender;
            setOtherUser(other);
          }
        } catch (error) {
          console.error('Failed to load messages:', error);
          setMessages([]);
        } finally {
          setLoading(false);
        }
      };

      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ride?._id, otherUser?._id, user.role, user._id]);

  // Socket event listener'ı ayarla
  useEffect(() => {
    if (isOpen && ride && socket && ride._id) {
      const handleNewMessage = (message) => {
        // Bu mesaj bu sohbet için mi kontrol et
        const messageRideId = typeof message.ride === 'object' ? message.ride._id?.toString() : message.ride?.toString();
        const rideIdStr = ride._id?.toString();
        
        if (messageRideId === rideIdStr) {
          const currentOtherUserId = otherUser?._id?.toString() || (user.role === 'passenger' ? ride.driver?._id?.toString() : null);
          const senderId = typeof message.sender === 'object' ? message.sender._id?.toString() : message.sender?.toString();
          const receiverId = typeof message.receiver === 'object' ? message.receiver._id?.toString() : message.receiver?.toString();
          const userIdStr = user._id?.toString();
          
          // Mesaj bize gönderildiyse veya biz gönderdiysek
          if ((senderId === currentOtherUserId && receiverId === userIdStr) || 
              (senderId === userIdStr && receiverId === currentOtherUserId)) {
            setMessages(prev => {
              // Mesaj zaten var mı kontrol et (duplicate prevention)
              const exists = prev.some(m => m._id === message._id);
              if (exists) return prev;
              return [...prev, message];
            });
          }
        }
      };

      socket.on('new-message', handleNewMessage);

      return () => {
        socket.off('new-message', handleNewMessage);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ride?._id, socket, user._id, user.role, otherUser?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const receiverId = otherUser?._id || (user.role === 'passenger' ? ride.driver?._id : null);
    
    if (!receiverId) {
      alert('Receiver not found');
      return;
    }

    setSending(true);
    try {
      const sentMessage = await messageService.sendMessage({
        receiverId: receiverId,
        rideId: ride._id,
        content: newMessage.trim()
      });
      
      // Mesajı local state'e ekle (optimistic update)
      setMessages(prev => {
        const exists = prev.some(m => m._id === sentMessage._id);
        if (exists) return prev;
        return [...prev, sentMessage];
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col border border-gray-100 overflow-hidden animate-fade-in-up">
        
        {/* --- HEADER (Yeşil) --- */}
        <div className="bg-[#004225] text-white p-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            {(otherUser?.profilePicture || (user.role === 'passenger' && ride.driver?.profilePicture)) ? (
              <img
                src={otherUser?.profilePicture || ride.driver?.profilePicture}
                alt={otherUser?.username || ride.driver?.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-emerald-400/50">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {otherUser?.username || (user.role === 'passenger' ? ride.driver?.username : 'Chat')}
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                {ride.origin} → {ride.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* --- MESSAGES AREA --- */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                
                <p>No messages yet. Send the first message!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender._id === user._id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3.5 shadow-sm relative ${
                      isOwn
                        ? 'bg-[#004225] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-emerald-600">
                        {message.sender.username}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`text-[10px] mt-1.5 text-right ${
                        isOwn ? 'text-emerald-200' : 'text-gray-400'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* --- INPUT AREA --- */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
              disabled={sending || (!otherUser && user.role !== 'passenger')}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim() || (!otherUser && user.role !== 'passenger' && !ride.driver)}
              className="bg-[#004225] text-white px-6 py-2 rounded-xl hover:bg-[#00331b] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center"
            >
              {sending ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                 <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ChatModal;