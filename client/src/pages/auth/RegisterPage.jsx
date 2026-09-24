import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ErrorBanner from '../../components/common/ErrorBanner';
import { roleHome } from '../../routes/roleHome';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Wrench className="text-accent" size={22} />
          <span className="font-display text-xl font-semibold text-ink">CareConnect</span>
        </div>
        <div className="panel p-6">
          <h1 className="mb-1 font-display text-lg font-semibold text-ink">Create an account</h1>
          <p className="mb-5 text-sm text-slate">Book a service, or sign up to offer one.</p>

          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'customer' })}
                className={`rounded-sm border px-3 py-2 text-sm ${form.role === 'customer' ? 'border-ink bg-ink text-paper' : 'border-line text-slate'}`}
              >
                I need a service
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'provider' })}
                className={`rounded-sm border px-3 py-2 text-sm ${form.role === 'provider' ? 'border-ink bg-ink text-paper' : 'border-line text-slate'}`}
              >
                I provide a service
              </button>
            </div>
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input id="phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate">
            Already have an account? <Link to="/login" className="text-accent-deep hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
