import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { requestApi } from '../../services/api/requestApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function MyRequestsPage() {
  const { data, loading, error } = useFetch(() => requestApi.mine().then((r) => r.data.data), []);

  return (
    <div>
      <PageHeader
        title="My Requests"
        description="Every service request you've posted, and where it stands."
        action={
          <Link to="/customer/requests/new" className="btn-accent">
            <Plus size={16} /> New request
          </Link>
        }
      />

      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-danger">{error}</p>}

      {data && data.requests.length === 0 && (
        <EmptyState
          title="No requests yet"
          description="Post your first service request to start getting quotes from providers."
          action={<Link to="/customer/requests/new" className="btn-primary">Post a request</Link>}
        />
      )}

      {data && data.requests.length > 0 && (
        <div className="panel">
          {data.requests.map((r) => (
            <Link key={r._id} to={`/customer/requests/${r._id}`} className="ticket-row hover:bg-paper">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-ink">{r.description}</p>
                <p className="text-xs text-slate">{r.category?.name || 'Uncategorized'} · {formatDate(r.createdAt)}</p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
