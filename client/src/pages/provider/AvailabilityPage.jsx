import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { availabilityApi } from '../../services/api/availabilityApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import { formatDateTime, toDatetimeLocal } from '../../utils/formatters';

export default function AvailabilityPage() {
  const { data, loading, refetch } = useFetch(() => availabilityApi.listMine().then((r) => r.data.data.slots), []);
  const [start, setStart] = useState(toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [end, setEnd] = useState(toDatetimeLocal(new Date(Date.now() + 26 * 60 * 60 * 1000)));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await availabilityApi.addSlot({ startTime: new Date(start).toISOString(), endTime: new Date(end).toISOString() });
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeSlot = async (id) => {
    try {
      await availabilityApi.deleteSlot(id);
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove slot.');
    }
  };

  return (
    <div>
      <PageHeader title="Availability" description="Open time slots customers can book you for." />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <form onSubmit={addSlot} className="panel mb-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label" htmlFor="start">Start</label>
          <input id="start" type="datetime-local" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="end">End</label>
          <input id="end" type="datetime-local" className="input" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <button type="submit" disabled={submitting} className="btn-accent">
          <Plus size={16} /> Add slot
        </button>
      </form>

      {loading && <LoadingSpinner />}
      {data && data.length === 0 && <EmptyState title="No availability set" description="Add slots so customers know when you're free." />}
      {data && data.length > 0 && (
        <div className="panel">
          {data.map((s) => (
            <div key={s._id} className="ticket-row">
              <div className="flex-1">
                <p className="text-sm text-ink">{formatDateTime(s.startTime)} → {formatDateTime(s.endTime)}</p>
                <p className="text-xs text-slate">{s.isBooked ? 'Booked' : 'Open'}</p>
              </div>
              {!s.isBooked && (
                <button onClick={() => removeSlot(s._id)} className="btn-outline" aria-label="Remove slot">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
