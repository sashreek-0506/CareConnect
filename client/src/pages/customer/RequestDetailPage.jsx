import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Sparkles } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { requestApi } from '../../services/api/requestApi';
import { quoteApi } from '../../services/api/quoteApi';
import { bookingApi } from '../../services/api/bookingApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import ErrorBanner from '../../components/common/ErrorBanner';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDateTime, toDatetimeLocal } from '../../utils/formatters';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookingQuote, setBookingQuote] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: request, loading: loadingRequest, refetch: refetchRequest } = useFetch(
    () => requestApi.get(id).then((r) => r.data.data.request), [id]
  );
  const { data: quotesData, loading: loadingQuotes, refetch: refetchQuotes } = useFetch(
    () => quoteApi.forRequest(id).then((r) => r.data.data), [id]
  );
  const { data: rankedData } = useFetch(
    () => requestApi.rankedProviders(id).then((r) => r.data.data), [id]
  );

  const openBookingModal = (quote) => {
    setBookingQuote(quote);
    setError('');
    const defaultStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setStartTime(toDatetimeLocal(defaultStart));
  };

  const confirmBooking = async () => {
    setSubmitting(true);
    setError('');
    try {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + bookingQuote.estimatedDurationMinutes * 60000);
      const { data } = await bookingApi.create({
        quoteId: bookingQuote._id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      navigate(`/bookings/${data.data.booking._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not confirm this booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRequest) return <LoadingSpinner />;
  if (!request) return null;

  return (
    <div>
      <PageHeader title="Service Request" description={request.description} action={<StatusBadge status={request.status} />} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="text-xs text-slate">Category</p>
          <p className="text-sm font-medium text-ink">{request.category?.name || 'Uncategorized'}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-slate">Location</p>
          <p className="text-sm font-medium text-ink">{request.location?.area || '—'}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-slate">Budget</p>
          <p className="text-sm font-medium text-ink">
            {request.budgetRange?.min || request.budgetRange?.max
              ? `${formatCurrency(request.budgetRange.min)} – ${formatCurrency(request.budgetRange.max)}`
              : 'Not specified'}
          </p>
        </div>
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">Quotes</h2>
      {loadingQuotes && <LoadingSpinner label="Loading quotes…" />}
      {quotesData && quotesData.quotes.length === 0 && (
        <EmptyState title="No quotes yet" description="Verified providers matching this request will submit quotes here." />
      )}
      {quotesData && quotesData.quotes.length > 0 && (
        <div className="panel mb-8">
          {quotesData.quotes.map((q) => (
            <div key={q._id} className="ticket-row">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{q.provider?.user?.name}</p>
                <p className="text-xs text-slate">{q.notes || 'No additional notes.'}</p>
                <p className="mt-1 text-xs text-slate">Est. {q.estimatedDurationMinutes} min</p>
              </div>
              <p className="font-mono text-sm font-semibold text-ink">{formatCurrency(q.price)}</p>
              <StatusBadge status={q.status} />
              {q.status === 'pending' && request.status !== 'booked' && (
                <button onClick={() => openBookingModal(q)} className="btn-accent">Book</button>
              )}
            </div>
          ))}
        </div>
      )}

      {rankedData && rankedData.providers.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Sparkles size={16} className="text-accent" /> AI-Recommended Providers
          </h2>
          <div className="panel">
            {rankedData.providers.slice(0, 5).map((p) => (
              <div key={p.providerId} className="ticket-row">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-slate">{p.serviceAreas?.join(', ')}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate">
                  <Star size={12} className="fill-accent text-accent" /> {p.avgRating?.toFixed(1) || '—'}
                </div>
                <div className="w-24 text-right font-mono text-xs text-slate">
                  Match {Math.round(p.matchScore * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookingQuote && (
        <Modal
          title="Confirm booking"
          onClose={() => setBookingQuote(null)}
          footer={
            <>
              <button onClick={() => setBookingQuote(null)} className="btn-outline">Cancel</button>
              <button onClick={confirmBooking} disabled={submitting} className="btn-accent">
                {submitting ? 'Booking…' : 'Confirm booking'}
              </button>
            </>
          }
        >
          {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
          <p className="mb-3 text-sm text-slate">
            Booking {bookingQuote.provider?.user?.name} for {formatCurrency(bookingQuote.price)}, est. {bookingQuote.estimatedDurationMinutes} minutes.
          </p>
          <label className="label" htmlFor="startTime">Start time</label>
          <input
            id="startTime" type="datetime-local" className="input"
            value={startTime} onChange={(e) => setStartTime(e.target.value)}
          />
          <p className="mt-2 text-xs text-slate">
            Ends around {formatDateTime(new Date(new Date(startTime).getTime() + (bookingQuote.estimatedDurationMinutes || 0) * 60000))}
          </p>
        </Modal>
      )}
    </div>
  );
}
