import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const SocketContext = createContext({
  socket: null,
  onlineUsers: [],
  unreadNotificationsCount: 0,
  setUnreadNotificationsCount: () => {},
});

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const rawSocketUrl = (import.meta.env.VITE_SOCKET_URL || '').trim();
    const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
    const socketUrl = rawSocketUrl ? rawSocketUrl.replace(/\/+$/, '') : 
      (rawApiUrl ? rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '') : window.location.origin);
    const newSocket = io(socketUrl, {
      query: { userId: user._id },
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // console.log('[Socket Connected]', newSocket.id);
    });

    // Real-time in-app notification handler
    newSocket.on('notification', (notification) => {
      setUnreadNotificationsCount(prev => prev + 1);
      toast((t) => (
        <div className="flex items-start space-x-2">
          <span className="text-xl">🔔</span>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{notification.title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">{notification.message}</p>
          </div>
        </div>
      ), { duration: 5000 });
    });

    // Direct message alert
    newSocket.on('direct_message_alert', ({ sender, message }) => {
      toast((t) => (
        <div className="flex items-start space-x-2">
          <span className="text-xl">💬</span>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">Message from {sender.name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{message.text}</p>
          </div>
        </div>
      ), { duration: 4000 });
    });

    // Certificate earned celebratory alert
    newSocket.on('certificate_earned', (certificate) => {
      toast.success(
        `🏆 Certificate Awarded! You earned ${certificate.hours} hours for "${certificate.eventTitle}"`,
        { duration: 7000, icon: '🎓' }
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
