import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

// Derive backend origin from VITE_API_URL without namespace corruption
const getSocketOrigin = () => {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl, window.location.origin);
      return parsed.origin;
    } catch {
      return apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    }
  }
  return 'http://localhost:5000';
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const seenNotifIdsRef = useRef(new Set());

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketOrigin = getSocketOrigin();

    // Connect to the backend origin
    const socketInstance = io(socketOrigin, {
      auth: (cb) => {
        cb({ token: localStorage.getItem('token') });
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect_error', (err) => {
      if (import.meta.env.DEV) {
        console.warn('[Socket.IO] Connection error:', err.message);
      }
    });

    // Global notification listener with ID deduplication (guards against StrictMode / re-renders)
    socketInstance.on('notification:new', (data) => {
      if (data?.id) {
        if (seenNotifIdsRef.current.has(data.id)) return;
        seenNotifIdsRef.current.add(data.id);
        if (seenNotifIdsRef.current.size > 100) {
          const first = seenNotifIdsRef.current.values().next().value;
          seenNotifIdsRef.current.delete(first);
        }
      }
      toast.success(`New Notification: ${data.message || data.title || 'Check your notifications'}`);
    });

    // Handle token refresh events dispatched by api.js
    const handleTokenRefreshed = (e) => {
      const newToken = e.detail || localStorage.getItem('token');
      if (newToken && socketInstance) {
        socketInstance.auth = { token: newToken };
        if (!socketInstance.connected) {
          socketInstance.connect();
        }
      }
    };
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);

    setSocket(socketInstance);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      socketInstance.disconnect();
      socketInstance.removeAllListeners();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
