import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { disputeApi } from '../../services/api/disputeApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const FILTERS = ['', 'open', 'in_review', 'resolved', 'escalated', 'closed'];

export default function DisputesInboxPage() {
  const [status, setStatus] = useState('');
  const { data, loading } = useFetch(() => disputeApi.list(status ? { status } : {}).then((r) => r.data.data), [status]);

  return (
    <div>
      <PageHeader title="Disputes Inbox" description="Triage and resolve disputes raised by customers or providers." />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <button
            key={s || 'all'} onClick={() => setStatus(s)}
            className={`rounded-sm border px-3 py-1.5 text-xs capitalize ${status === s ? 'border-ink bg-ink text-paper' : 'border-line text-slate'}`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {data && data.disputes.length === 0 && <EmptyState title="No disputes" description="Nothing needs your attention right now." />}
      {data && data.disputes.length > 0 && (
        <div className="panel">
          {data.disputes.map((d) => (
            <Link key={d._id} to={`/support/disputes/${d._id}`} className="ticket-row hover:bg-paper">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-ink">{d.reason}</p>
                <p className="text-xs text-slate">Raised by {d.raisedBy?.name} ({d.raisedBy?.role}) · {formatDate(d.createdAt)}</p>
              </div>
              <StatusBadge status={d.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
