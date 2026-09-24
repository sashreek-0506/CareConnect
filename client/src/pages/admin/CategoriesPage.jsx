import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { categoryApi } from '../../services/api/categoryApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import Modal from '../../components/common/Modal';

export default function CategoriesPage() {
  const { data, loading, refetch } = useFetch(() => categoryApi.list({ includeInactive: 'true' }).then((r) => r.data.data.categories), []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', requiredSkills: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const createCategory = async () => {
    setSubmitting(true);
    setError('');
    try {
      await categoryApi.create({
        name: form.name,
        description: form.description,
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      setForm({ name: '', description: '', requiredSkills: '' });
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create category.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (category) => {
    if (category.isActive) {
      await categoryApi.remove(category._id);
    } else {
      await categoryApi.update(category._id, { isActive: true });
    }
    await refetch();
  };

  return (
    <div>
      <PageHeader
        title="Service Categories"
        description="Drive AI classification and provider matching."
        action={<button onClick={() => setShowForm(true)} className="btn-accent"><Plus size={16} /> New category</button>}
      />

      {loading && <LoadingSpinner />}
      {data && (
        <div className="panel">
          {data.map((c) => (
            <div key={c._id} className="ticket-row">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="text-xs text-slate">{c.requiredSkills.join(', ') || 'No skills tagged'}</p>
              </div>
              <span className={`text-xs ${c.isActive ? 'text-success' : 'text-slate'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
              <button onClick={() => toggleActive(c)} className="btn-outline">{c.isActive ? 'Deactivate' : 'Activate'}</button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal
          title="New category"
          onClose={() => setShowForm(false)}
          footer={<button onClick={createCategory} disabled={submitting} className="btn-accent">Create</button>}
        >
          {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
          <div className="space-y-3">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={2} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Required skills (comma separated)</label>
              <input className="input" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
