import { useFetch } from '../../hooks/useFetch';
import { quoteApi } from '../../services/api/quoteApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export default function MyQuotesPage() {
  const { data, loading, refetch } = useFetch(() => quoteApi.mine().then((r) => r.data.data.quotes), []);

  const withdraw = async (id) => {
    await quoteApi.withdraw(id);
    await refetch();
  };

  return (
    <div>
      <PageHeader title="My Quotes" description="Every quote you've submitted, and its status." />
      {loading && <LoadingSpinner />}
      {data && data.length === 0 && <EmptyState title="No quotes yet" description="Quotes you submit on matching requests will appear here." />}
      {data && data.length > 0 && (
        <div className="panel">
          {data.map((q) => (
            <div key={q._id} className="ticket-row">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-ink">{q.request?.description}</p>
                <p className="text-xs text-slate">{formatCurrency(q.price)} · {q.estimatedDurationMinutes} min</p>
              </div>
              <StatusBadge status={q.status} />
              {q.status === 'pending' && (
                <button onClick={() => withdraw(q._id)} className="btn-outline">Withdraw</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
