import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationApi } from '../services/api/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await notificationApi.list();
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {
      // Silently ignore -- notifications are non-critical UI.
    }
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return undefined;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const markRead = useCallback(async (id) => {
    await notificationApi.markRead(id);
    await refresh();
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    await refresh();
  }, [refresh]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
