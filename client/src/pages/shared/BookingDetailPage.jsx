import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { bookingApi } from '../../services/api/bookingApi';
import { jobApi } from '../../services/api/jobApi';
import { reviewApi } from '../../services/api/reviewApi';
import { disputeApi } from '../../services/api/disputeApi';
import { invoiceApi } from '../../services/api/invoiceApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ErrorBanner from '../../components/common/ErrorBanner';
import Modal from '../../components/common/Modal';
import BookingStatusTimeline from '../../components/bookings/BookingStatusTimeline';
import EvidenceUploader from '../../components/bookings/EvidenceUploader';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const NEXT_STATUS = {
  scheduled: 'en_route',
  en_route: 'in_progress',
  in_progress: 'completed',
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: booking, loading, refetch } = useFetch(() => bookingApi.get(id).then((r) => r.data.data.booking), [id]);
  const { data: invoiceData } = useFetch(
    () => (['completed', 'closed'].includes(booking?.status) ? invoiceApi.forBooking(id).then((r) => r.data.data.invoice) : Promise.resolve(null)),
    [id, booking?.status]
  );

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  if (loading) return <LoadingSpinner />;
  if (!booking) return null;

  const isProvider = user.role === 'provider';
  const isCustomer = user.role === 'customer';

  const advanceStatus = async () => {
    const nextStatus = NEXT_STATUS[booking.status];
    if (!nextStatus) return;
    setBusy(true);
    setError('');
    try {
      await jobApi.addUpdate(id, {
        status: nextStatus,
        note: '',
        attachments: nextStatus === 'completed' ? afterPhotos : [],
      });
      setAfterPhotos([]);
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update job status.');
    } finally {
      setBusy(false);
    }
  };

  const confirmCompletion = async () => {
    setBusy(true);
    setError('');
    try {
      await jobApi.confirm(id);
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not confirm completion.');
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async () => {
    setBusy(true);
    setError('');
    try {
      await reviewApi.create({ booking: id, ...reviewForm });
      setShowReview(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setBusy(false);
    }
  };

  const submitDispute = async () => {
    setBusy(true);
    setError('');
    try {
      await disputeApi.create({ booking: id, reason: disputeReason });
      setShowDispute(false);
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not raise dispute.');
    } finally {
      setBusy(false);
    }
  };

  const cancelBooking = async () => {
    setBusy(true);
    setError('');
    try {
      await bookingApi.cancel(id, { reason: 'Cancelled by user.' });
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setBusy(false);
    }
  };

  const counterpartyName = isCustomer ? booking.provider?.user?.name : booking.customer?.name;

  return (
    <div>
      <PageHeader
        title={booking.request?.description || 'Booking'}
        description={`With ${counterpartyName || '—'} · ${formatDateTime(booking.slot?.startTime)}`}
        action={<StatusBadge status={booking.status} />}
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="panel p-5 md:col-span-2">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Job Timeline</h2>
          <BookingStatusTimeline timeline={booking.timeline} />
        </div>

        <div className="space-y-4">
          {isProvider && ['scheduled', 'en_route', 'in_progress'].includes(booking.status) && (
            <div className="panel p-4">
              <h3 className="mb-2 text-sm font-semibold text-ink">Update job status</h3>
              {booking.status === 'in_progress' && (
                <div className="mb-3">
                  <p className="mb-1 text-xs text-slate">After-service photo (required to complete)</p>
                  <EvidenceUploader label="After" onAdd={(url) => setAfterPhotos((p) => [...p, url])} />
                  {afterPhotos.length > 0 && <p className="mt-1 text-xs text-success">{afterPhotos.length} photo(s) added.</p>}
                </div>
              )}
              <button onClick={advanceStatus} disabled={busy} className="btn-accent w-full">
                Mark as {NEXT_STATUS[booking.status]?.replace('_', ' ')}
              </button>
            </div>
          )}

          {isCustomer && booking.status === 'completed' && (
            <div className="panel p-4">
              <h3 className="mb-2 text-sm font-semibold text-ink">Confirm completion</h3>
              <p className="mb-3 text-xs text-slate">Confirming closes the job and generates your invoice.</p>
              <button onClick={confirmCompletion} disabled={busy} className="btn-accent w-full">Confirm completion</button>
            </div>
          )}

          {isCustomer && booking.status === 'closed' && (
            <div className="panel p-4">
              <h3 className="mb-2 text-sm font-semibold text-ink">Leave a review</h3>
              <button onClick={() => setShowReview(true)} className="btn-outline w-full">Rate this provider</button>
            </div>
          )}

          {invoiceData && (
            <div className="panel p-4">
              <h3 className="mb-2 text-sm font-semibold text-ink">Invoice</h3>
              {invoiceData.lineItems.map((li, i) => (
                <div key={i} className="flex justify-between text-sm text-slate"><span>{li.label}</span><span>{formatCurrency(li.amount)}</span></div>
              ))}
              <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-semibold text-ink">
                <span>Total</span><span>{formatCurrency(invoiceData.total)}</span>
              </div>
              <p className="mt-2 text-xs text-slate">Payment: {invoiceData.paymentStatus}</p>
            </div>
          )}

          {['scheduled', 'en_route', 'in_progress', 'completed'].includes(booking.status) && (
            <div className="panel p-4">
              <h3 className="mb-2 text-sm font-semibold text-ink">Need help?</h3>
              <div className="space-y-2">
                <button onClick={() => setShowDispute(true)} className="btn-outline w-full">Raise a dispute</button>
                {['scheduled'].includes(booking.status) && (
                  <button onClick={cancelBooking} disabled={busy} className="btn-danger w-full">Cancel booking</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReview && (
        <Modal
          title="Rate this provider"
          onClose={() => setShowReview(false)}
          footer={<button onClick={submitReview} disabled={busy} className="btn-accent">Submit review</button>}
        >
          <label className="label">Rating</label>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })} className={`text-2xl ${n <= reviewForm.rating ? 'text-accent' : 'text-line'}`}>★</button>
            ))}
          </div>
          <label className="label" htmlFor="comment">Comment</label>
          <textarea id="comment" rows={3} className="input" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
        </Modal>
      )}

      {showDispute && (
        <Modal
          title="Raise a dispute"
          onClose={() => setShowDispute(false)}
          footer={<button onClick={submitDispute} disabled={busy || disputeReason.length < 5} className="btn-danger">Submit dispute</button>}
        >
          <label className="label" htmlFor="reason">What went wrong?</label>
          <textarea id="reason" rows={4} className="input" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
        </Modal>
      )}
    </div>
  );
}
