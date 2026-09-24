import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { userApi } from '../../services/api/userApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { statusLabel } from '../../utils/formatters';

const ROLES = ['', 'customer', 'provider', 'ops', 'support', 'admin'];

export default function UsersPage() {
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, refetch } = useFetch(
    () => userApi.list({ ...(role ? { role } : {}), ...(search ? { search } : {}) }).then((r) => r.data.data),
    [role, search]
  );

  const toggleActive = async (user) => {
    await userApi.update(user._id, { isActive: !user.isActive });
    await refetch();
  };

  return (
    <div>
      <PageHeader title="Users" description="All accounts on the platform." />

      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {ROLES.map((r) => (
          <button key={r || 'all'} onClick={() => setRole(r)} className={`rounded-sm border px-3 py-1.5 text-xs capitalize ${role === r ? 'border-ink bg-ink text-paper' : 'border-line text-slate'}`}>
            {r || 'All roles'}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {data && (
        <div className="panel">
          {data.users.map((u) => (
            <div key={u._id} className="ticket-row">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{u.name}</p>
                <p className="text-xs text-slate">{u.email}</p>
              </div>
              <span className="rounded-sm bg-line px-2 py-0.5 font-mono text-xs text-ink">{statusLabel(u.role)}</span>
              <span className={`text-xs ${u.isActive ? 'text-success' : 'text-danger'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span>
              <button onClick={() => toggleActive(u)} className="btn-outline">{u.isActive ? 'Deactivate' : 'Reactivate'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
