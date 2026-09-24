import { useState } from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { statusLabel } from '../../utils/formatters';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-line bg-panel px-6 py-3">
      <div>
        <p className="text-xs text-slate">Welcome back</p>
        <p className="font-display text-sm font-semibold text-ink">{user.name} · {statusLabel(user.role)}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative rounded-sm border border-line p-2 text-slate hover:border-ink hover:text-ink"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 z-40 mt-2 w-80 rounded-md border border-line bg-panel shadow-lg">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <p className="text-sm font-medium text-ink">Notifications</p>
                <button onClick={markAllRead} className="text-xs text-accent-deep hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-slate">No notifications yet.</p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    className={`block w-full border-b border-line px-4 py-3 text-left text-sm last:border-b-0 hover:bg-paper ${
                      n.isRead ? 'text-slate' : 'text-ink'
                    }`}
                  >
                    {n.message}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-sm border border-line px-3 py-2 text-sm text-slate">
          <User size={16} />
          {user.email}
        </div>
        <button onClick={logout} className="btn-outline" aria-label="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
