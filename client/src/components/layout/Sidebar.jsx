import { NavLink } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_BY_ROLE } from './navConfig';

export default function Sidebar() {
  const { user } = useAuth();
  const items = NAV_BY_ROLE[user.role] || [];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-ink text-paper md:flex md:flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <Wrench size={20} className="text-accent" />
        <span className="font-display text-lg font-semibold tracking-tight">CareConnect</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-ink-soft text-accent' : 'text-paper/80 hover:bg-ink-soft hover:text-paper'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-soft px-5 py-4 text-xs text-paper/60">
        Logged in as <span className="font-mono">{user.role}</span>
      </div>
    </aside>
  );
}
