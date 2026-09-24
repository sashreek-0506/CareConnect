import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { requestApi } from '../../services/api/requestApi';
import { categoryApi } from '../../services/api/categoryApi';
import PageHeader from '../../components/common/PageHeader';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.data.categories));
  }, []);

  const runClassifier = async () => {
    if (description.trim().length < 10) return;
    setClassifying(true);
    try {
      const { data } = await requestApi.classifyPreview(description);
      setSuggestion(data.data.classification);
    } catch {
      // Non-critical; the request can still be created manually.
    } finally {
      setClassifying(false);
    }
  };

  const acceptSuggestion = () => {
    const match = categories.find((c) => c.name === suggestion.categoryName);
    if (match) setCategoryId(match._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        description,
        location: { area, address },
        budgetRange: { min: Number(budgetMin) || 0, max: Number(budgetMax) || 0 },
      };
      if (categoryId) payload.category = categoryId;
      const { data } = await requestApi.create(payload);
      navigate(`/customer/requests/${data.data.request._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Describe what you need" description="Give a few details and we'll match you with the right providers." />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <form onSubmit={handleSubmit} className="panel space-y-5 p-6">
        <div>
          <label className="label" htmlFor="description">What's the issue?</label>
          <textarea
            id="description" rows={4} required className="input"
            placeholder="e.g. The kitchen sink has been leaking under the cabinet since this morning."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={runClassifier}
          />
          <button type="button" onClick={runClassifier} disabled={classifying} className="mt-2 flex items-center gap-1 text-xs text-accent-deep hover:underline">
            <Sparkles size={12} /> {classifying ? 'Analyzing…' : 'Suggest a category with AI'}
          </button>

          {suggestion && suggestion.categoryName && (
            <div className="mt-3 rounded-sm border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-ink">
              Looks like <strong>{suggestion.categoryName}</strong> ({Math.round((suggestion.confidence || 0) * 100)}% confidence).
              <button type="button" onClick={acceptSuggestion} className="ml-2 text-accent-deep underline">Use this</button>
            </div>
          )}
        </div>

        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Let AI decide from the description</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="area">Area / locality</label>
            <input id="area" className="input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Koramangala" />
          </div>
          <div>
            <label className="label" htmlFor="address">Address</label>
            <input id="address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="budgetMin">Budget min (₹)</label>
            <input id="budgetMin" type="number" min="0" className="input" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="budgetMax">Budget max (₹)</label>
            <input id="budgetMax" type="number" min="0" className="input" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-accent w-full sm:w-auto">
          {submitting ? 'Posting request…' : 'Post request'}
        </button>
      </form>
    </div>
  );
}
