import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { disputeApi } from '../../services/api/disputeApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ErrorBanner from '../../components/common/ErrorBanner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const RESOLUTION_ACTIONS = ['refund', 'partial_refund', 're_service', 'dismissed'];

export default function DisputeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: dispute, loading, refetch } = useFetch(() => disputeApi.get(id).then((r) => r.data.data.dispute), [id]);

  const [note, setNote] = useState('');
  const [resolution, setResolution] = useState({ action: 'refund', amount: '', note: '', status: 'resolved' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (!dispute) return null;

  const canResolve = user.role === 'admin' || user.role === 'support';
  const booking = dispute.booking;

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    setError('');
    try {
      await disputeApi.addNote(id, note.trim());
      setNote('');
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add note.');
    } finally {
      setBusy(false);
    }
  };

  const resolve = async () => {
    setBusy(true);
    setError('');
    try {
      await disputeApi.resolve(id, { ...resolution, amount: Number(resolution.amount) || 0 });
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve dispute.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title={dispute.reason} description={`Booking: ${booking?.request?.description || booking?._id}`} action={<StatusBadge status={dispute.status} />} />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="panel p-5 md:col-span-2">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Activity Log</h2>
          <ol className="space-y-4">
            {dispute.activityLog.map((entry, idx) => (
              <li key={idx} className="border-b border-line pb-3 last:border-b-0">
                <p className="text-xs text-slate">{formatDateTime(entry.timestamp)} · {entry.action}</p>
                <p className="text-sm text-ink">{entry.note}</p>
              </li>
            ))}
          </ol>

          {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
            <div className="mt-5 flex gap-2">
              <input className="input" placeholder="Add an internal note or update…" value={note} onChange={(e) => setNote(e.target.value)} />
              <button onClick={addNote} disabled={busy} className="btn-outline shrink-0">Add note</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <h3 className="mb-2 text-sm font-semibold text-ink">Parties</h3>
            <p className="text-sm text-slate">Customer: {booking?.customer?.name}</p>
            <p className="text-sm text-slate">Provider: {booking?.provider?.user?.name}</p>
            <p className="mt-2 text-xs text-slate">Booked: {formatDateTime(booking?.slot?.startTime)}</p>
          </div>

          {canResolve && dispute.status !== 'resolved' && dispute.status !== 'closed' && (
            <div className="panel p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">Resolve dispute</h3>
              <label className="label">Action</label>
              <select className="input mb-3" value={resolution.action} onChange={(e) => setResolution({ ...resolution, action: e.target.value })}>
                {RESOLUTION_ACTIONS.map((a) => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
              </select>
              {(resolution.action === 'refund' || resolution.action === 'partial_refund') && (
                <>
                  <label className="label">Refund amount (₹)</label>
                  <input type="number" min="0" className="input mb-3" value={resolution.amount} onChange={(e) => setResolution({ ...resolution, amount: e.target.value })} />
                </>
              )}
              <label className="label">Resolution note</label>
              <textarea rows={3} className="input mb-3" value={resolution.note} onChange={(e) => setResolution({ ...resolution, note: e.target.value })} />
              <label className="label">Outcome</label>
              <select className="input mb-3" value={resolution.status} onChange={(e) => setResolution({ ...resolution, status: e.target.value })}>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalate to Admin</option>
                <option value="closed">Close</option>
              </select>
              <button onClick={resolve} disabled={busy} className="btn-accent w-full">Submit resolution</button>
            </div>
          )}

          {dispute.resolution?.action && (
            <div className="panel p-4">
              <h3 className="mb-2 text-sm font-semibold text-ink">Resolution</h3>
              <p className="text-sm text-slate">Action: {dispute.resolution.action.replace('_', ' ')}</p>
              {dispute.resolution.amount > 0 && <p className="text-sm text-slate">Amount: {formatCurrency(dispute.resolution.amount)}</p>}
              <p className="mt-1 text-sm text-slate">{dispute.resolution.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
