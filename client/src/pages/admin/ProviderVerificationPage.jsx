import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { providerApi } from '../../services/api/providerApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

const FILTERS = ['pending', 'approved', 'rejected'];

export default function ProviderVerificationPage() {
  const [status, setStatus] = useState('pending');
  const { data, loading, refetch } = useFetch(() => providerApi.listAll({ status }).then((r) => r.data.data), [status]);
  const [target, setTarget] = useState(null);
  const [note, setNote] = useState('');

  const decide = async (decision) => {
    await providerApi.setVerification(target._id, { verificationStatus: decision, verificationNote: note });
    setTarget(null);
    setNote('');
    await refetch();
  };

  return (
    <div>
      <PageHeader title="Provider Verification" description="Review documents and approve providers before they can quote." />

      <div className="mb-4 flex gap-2">
        {FILTERS.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-sm border px-3 py-1.5 text-xs capitalize ${status === s ? 'border-ink bg-ink text-paper' : 'border-line text-slate'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {data && data.providers.length === 0 && <EmptyState title="Nothing here" description="No providers with this status." />}
      {data && data.providers.length > 0 && (
        <div className="panel">
          {data.providers.map((p) => (
            <div key={p._id} className="ticket-row">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{p.user?.name}</p>
                <p className="text-xs text-slate">{p.user?.email} · {p.skills?.join(', ') || 'No skills listed'}</p>
                <p className="text-xs text-slate">{p.documents?.length || 0} document(s) submitted</p>
              </div>
              <StatusBadge status={p.verificationStatus} />
              {p.verificationStatus === 'pending' && (
                <button onClick={() => setTarget(p)} className="btn-accent">Review</button>
              )}
            </div>
          ))}
        </div>
      )}

      {target && (
        <Modal
          title={`Review: ${target.user?.name}`}
          onClose={() => setTarget(null)}
          footer={
            <>
              <button onClick={() => decide('rejected')} className="btn-danger">Reject</button>
              <button onClick={() => decide('approved')} className="btn-accent">Approve</button>
            </>
          }
        >
          <p className="mb-2 text-sm text-slate">{target.bio || 'No bio provided.'}</p>
          <div className="mb-3 space-y-1">
            {(target.documents || []).map((d, i) => (
              <a key={i} href={d.url} target="_blank" rel="noreferrer" className="block text-sm text-accent-deep underline">
                {d.label || `Document ${i + 1}`}
              </a>
            ))}
            {(!target.documents || target.documents.length === 0) && <p className="text-sm text-slate">No documents uploaded.</p>}
          </div>
          <label className="label">Note (optional)</label>
          <textarea rows={2} className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </Modal>
      )}
    </div>
  );
}
