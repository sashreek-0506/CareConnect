import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper text-center">
      <p className="font-display text-4xl font-semibold text-ink">404</p>
      <p className="text-sm text-slate">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">Go home</Link>
    </div>
  );
}
