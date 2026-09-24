import { useFetch } from '../../hooks/useFetch';
import { analyticsApi } from '../../services/api/analyticsApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function StatCard({ label, value, tone = 'ink' }) {
  const toneClass = { ink: 'text-ink', success: 'text-success', danger: 'text-danger', warning: 'text-warning' }[tone];
  return (
    <div className="panel p-5">
      <p className="text-xs text-slate">{label}</p>
      <p className={`mt-1 font-display text-3xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, loading } = useFetch(() => analyticsApi.summary().then((r) => r.data.data), []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const maxDemand = Math.max(...data.categoryDemand.map((c) => c.count), 1);

  return (
    <div>
      <PageHeader title="Analytics" description="Platform health at a glance." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Bookings" value={data.activeBookings} />
        <StatCard label="Completed" value={data.completedBookings} tone="success" />
        <StatCard label="Completion Rate" value={`${data.completionRate}%`} />
        <StatCard label="Open Disputes" value={data.openDisputes} tone={data.openDisputes > 0 ? 'danger' : 'ink'} />
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Demand by Category</h2>
        <div className="space-y-3">
          {data.categoryDemand.map((c) => (
            <div key={c.name}>
              <div className="mb-1 flex justify-between text-xs text-slate">
                <span>{c.name}</span><span>{c.count}</span>
              </div>
              <div className="h-2 rounded-full bg-line">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${(c.count / maxDemand) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.pendingVerifications > 0 && (
        <p className="mt-4 text-sm text-slate">
          {data.pendingVerifications} provider{data.pendingVerifications > 1 ? 's' : ''} awaiting verification.
        </p>
      )}
    </div>
  );
}
