import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { bookingApi } from '../../services/api/bookingApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import BookingList from '../../components/bookings/BookingList';

const STATUS_FILTERS = ['', 'scheduled', 'en_route', 'in_progress', 'completed', 'closed', 'cancelled', 'disputed'];

export default function BookingsOverviewPage() {
  const [status, setStatus] = useState('');
  const { data, loading } = useFetch(() => bookingApi.all(status ? { status } : {}).then((r) => r.data.data), [status]);

  return (
    <div>
      <PageHeader title="Bookings Overview" description="Every booking on the platform. Monitor progress and step in on escalations." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || 'all'} onClick={() => setStatus(s)}
            className={`rounded-sm border px-3 py-1.5 text-xs capitalize ${status === s ? 'border-ink bg-ink text-paper' : 'border-line text-slate'}`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {data && data.bookings.length === 0 && <EmptyState title="No bookings found" description="Try a different filter." />}
      {data && data.bookings.length > 0 && <BookingList bookings={data.bookings} perspective="customer" />}
    </div>
  );
}
