import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

// Shared ledger-style list of bookings, used by customer, provider, and ops pages.
// `perspective` controls whose name is shown as the "counterparty".
export default function BookingList({ bookings, perspective }) {
  return (
    <div className="panel">
      {bookings.map((b) => {
        const counterparty = perspective === 'customer' ? b.provider?.user?.name : b.customer?.name;
        return (
          <Link key={b._id} to={`/bookings/${b._id}`} className="ticket-row hover:bg-paper">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-ink">{b.request?.description}</p>
              <p className="text-xs text-slate">
                {perspective === 'customer' ? 'Provider' : 'Customer'}: {counterparty || '—'} · {formatDateTime(b.slot?.startTime)}
              </p>
            </div>
            <StatusBadge status={b.status} />
          </Link>
        );
      })}
    </div>
  );
}
