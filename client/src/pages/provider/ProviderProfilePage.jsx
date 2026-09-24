import { useEffect, useState } from 'react';
import { providerApi } from '../../services/api/providerApi';
import { categoryApi } from '../../services/api/categoryApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import StatusBadge from '../../components/common/StatusBadge';

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([providerApi.getMine(), categoryApi.list()]).then(([p, c]) => {
      setProfile(p.data.data.provider);
      setCategories(c.data.data.categories);
      setLoading(false);
    });
  }, []);

  const toggleCategory = (id) => {
    setProfile((p) => {
      const has = p.categories.some((c) => (c._id || c) === id);
      return {
        ...p,
        categories: has ? p.categories.filter((c) => (c._id || c) !== id) : [...p.categories, id],
      };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload = {
        bio: profile.bio,
        skills: profile.skills,
        categories: profile.categories.map((c) => c._id || c),
        serviceAreas: profile.serviceAreas,
        experienceYears: Number(profile.experienceYears) || 0,
        pricing: profile.pricing,
      };
      const { data } = await providerApi.updateMine(payload);
      setProfile(data.data.provider);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return null;

  return (
    <div>
      <PageHeader
        title="Provider Profile"
        description="This is what customers and the AI matcher see."
        action={<StatusBadge status={profile.verificationStatus} />}
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      {saved && <p className="mb-4 text-sm text-success">Profile saved.</p>}

      <form onSubmit={save} className="panel space-y-5 p-6">
        <div>
          <label className="label" htmlFor="bio">Bio</label>
          <textarea id="bio" rows={3} className="input" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
        </div>

        <div>
          <label className="label">Categories you work in</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = profile.categories.some((pc) => (pc._id || pc) === c._id);
              return (
                <button
                  type="button" key={c._id} onClick={() => toggleCategory(c._id)}
                  className={`rounded-sm border px-3 py-1.5 text-sm ${active ? 'border-ink bg-ink text-paper' : 'border-line text-slate'}`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="skills">Skills (comma separated)</label>
          <input
            id="skills" className="input" value={profile.skills.join(', ')}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
        </div>

        <div>
          <label className="label" htmlFor="areas">Service areas (comma separated)</label>
          <input
            id="areas" className="input" value={profile.serviceAreas.join(', ')}
            onChange={(e) => setProfile({ ...profile, serviceAreas: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="experience">Years of experience</label>
            <input id="experience" type="number" min="0" className="input" value={profile.experienceYears} onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pricingModel">Pricing model</label>
            <select id="pricingModel" className="input" value={profile.pricing.model} onChange={(e) => setProfile({ ...profile, pricing: { ...profile.pricing, model: e.target.value } })}>
              <option value="hourly">Hourly</option>
              <option value="flat">Flat rate</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="rate">Rate (₹)</label>
            <input id="rate" type="number" min="0" className="input" value={profile.pricing.rate} onChange={(e) => setProfile({ ...profile, pricing: { ...profile.pricing, rate: Number(e.target.value) } })} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-accent">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {profile.verificationStatus === 'pending' && (
        <p className="mt-4 text-sm text-slate">
          Your profile is awaiting admin verification. You'll be able to submit quotes once approved.
        </p>
      )}
    </div>
  );
}
