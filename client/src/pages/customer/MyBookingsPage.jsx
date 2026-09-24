import { useFetch } from '../../hooks/useFetch';
import { bookingApi } from '../../services/api/bookingApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import BookingList from '../../components/bookings/BookingList';

export default function MyBookingsPage() {
  const { data, loading, error } = useFetch(() => bookingApi.mine().then((r) => r.data.data), []);

  return (
    <div>
      <PageHeader title="My Bookings" description="Track every job you've booked, from scheduling to completion." />
      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-danger">{error}</p>}
      {data && data.bookings.length === 0 && (
        <EmptyState title="No bookings yet" description="Once you book a provider from a quote, it'll show up here." />
      )}
      {data && data.bookings.length > 0 && <BookingList bookings={data.bookings} perspective="customer" />}
    </div>
  );
}
