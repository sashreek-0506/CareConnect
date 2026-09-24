import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { requestApi } from '../../services/api/requestApi';
import { quoteApi } from '../../services/api/quoteApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

export default function MatchingRequestsPage() {
  const { data, loading, refetch } = useFetch(() => requestApi.matching().then((r) => r.data.data), []);
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({ price: '', estimatedDurationMinutes: '', notes: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openQuoteModal = (request) => {
    setTarget(request);
    setForm({ price: '', estimatedDurationMinutes: '', notes: '' });
    setError('');
  };

  const submitQuote = async () => {
    setSubmitting(true);
    setError('');
    try {
      await quoteApi.create({
        request: target._id,
        price: Number(form.price),
        estimatedDurationMinutes: Number(form.estimatedDurationMinutes),
        notes: form.notes,
      });
      setTarget(null);
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit quote.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Find Jobs" description="Open requests matching your categories. Submit a quote to be considered." />

      {loading && <LoadingSpinner />}
      {data && data.requests.length === 0 && (
        <EmptyState title="No matching requests right now" description="New requests in your categories will show up here." />
      )}
      {data && data.requests.length > 0 && (
        <div className="panel">
          {data.requests.map((r) => (
            <div key={r._id} className="ticket-row">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-ink">{r.description}</p>
                <p className="text-xs text-slate">{r.category?.name} · {r.location?.area || 'Area not specified'} · {formatDate(r.createdAt)}</p>
              </div>
              <button onClick={() => openQuoteModal(r)} className="btn-accent">Submit quote</button>
            </div>
          ))}
        </div>
      )}

      {target && (
        <Modal
          title="Submit a quote"
          onClose={() => setTarget(null)}
          footer={<button onClick={submitQuote} disabled={submitting} className="btn-accent">{submitting ? 'Submitting…' : 'Submit quote'}</button>}
        >
          {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
          <p className="mb-4 text-sm text-slate">{target.description}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="price">Price (₹)</label>
              <input id="price" type="number" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="duration">Duration (min)</label>
              <input id="duration" type="number" min="0" className="input" value={form.estimatedDurationMinutes} onChange={(e) => setForm({ ...form, estimatedDurationMinutes: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <label className="label" htmlFor="notes">Notes</label>
            <textarea id="notes" rows={3} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  );
}
