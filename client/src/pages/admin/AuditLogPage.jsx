import { useFetch } from '../../hooks/useFetch';
import { auditLogApi } from '../../services/api/auditLogApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';

export default function AuditLogPage() {
  const { data, loading } = useFetch(() => auditLogApi.list().then((r) => r.data.data), []);

  return (
    <div>
      <PageHeader title="Audit Log" description="Who did what, and when — for compliance and debugging." />
      {loading && <LoadingSpinner />}
      {data && data.logs.length === 0 && <EmptyState title="No activity logged yet" />}
      {data && data.logs.length > 0 && (
        <div className="panel">
          {data.logs.map((log) => (
            <div key={log._id} className="ticket-row">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">
                  <span className="font-medium">{log.actor?.name}</span> ({log.actor?.role}) — {log.action.replace(/_/g, ' ')}
                </p>
                <p className="font-mono text-xs text-slate">{log.resourceType} · {log.resourceId}</p>
              </div>
              <p className="whitespace-nowrap text-xs text-slate">{formatDateTime(log.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
