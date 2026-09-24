import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ErrorBanner from '../../components/common/ErrorBanner';
import { roleHome } from '../../routes/roleHome';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const dest = location.state?.from || roleHome(user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Wrench className="text-accent" size={22} />
          <span className="font-display text-xl font-semibold text-ink">CareConnect</span>
        </div>
        <div className="panel p-6">
          <h1 className="mb-1 font-display text-lg font-semibold text-ink">Log in</h1>
          <p className="mb-5 text-sm text-slate">Book trusted help for your home, or manage your jobs.</p>

          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email" type="email" required className="input"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password" type="password" required className="input"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate">
            New to CareConnect? <Link to="/register" className="text-accent-deep hover:underline">Create an account</Link>
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-slate">
          Demo password for seeded accounts: <span className="font-mono">Password123!</span>
        </p>
      </div>
    </div>
  );
}
