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
      <PageHeader title="My Jobs" description="Bookings assigned to you. Update status and add evidence as you work." />
      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-danger">{error}</p>}
      {data && data.bookings.length === 0 && <EmptyState title="No jobs yet" description="Once a customer books one of your quotes, it'll show up here." />}
      {data && data.bookings.length > 0 && <BookingList bookings={data.bookings} perspective="provider" />}
    </div>
  );
}
