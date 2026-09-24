import {
  ClipboardList, Search, CalendarClock, Wrench, LayoutGrid, ShieldCheck,
  Users, ScrollText, Gauge, MessageSquareWarning, ListChecks,
} from 'lucide-react';

// Central role -> nav-items map. Sidebar and route guards both read from this.
export const NAV_BY_ROLE = {
  customer: [
    { to: '/customer/requests/new', label: 'New Request', icon: ClipboardList },
    { to: '/customer/requests', label: 'My Requests', icon: ListChecks },
    { to: '/customer/bookings', label: 'My Bookings', icon: CalendarClock },
  ],
  provider: [
    { to: '/provider/matching', label: 'Find Jobs', icon: Search },
    { to: '/provider/quotes', label: 'My Quotes', icon: ClipboardList },
    { to: '/provider/bookings', label: 'My Jobs', icon: Wrench },
    { to: '/provider/availability', label: 'Availability', icon: CalendarClock },
    { to: '/provider/profile', label: 'Profile', icon: Users },
  ],
  ops: [
    { to: '/ops/bookings', label: 'Bookings Overview', icon: LayoutGrid },
    { to: '/ops/analytics', label: 'Analytics', icon: Gauge },
  ],
  support: [
    { to: '/support/disputes', label: 'Disputes Inbox', icon: MessageSquareWarning },
  ],
  admin: [
    { to: '/admin/categories', label: 'Categories', icon: ListChecks },
    { to: '/admin/verification', label: 'Provider Verification', icon: ShieldCheck },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/analytics', label: 'Analytics', icon: Gauge },
    { to: '/admin/audit-logs', label: 'Audit Log', icon: ScrollText },
  ],
};
