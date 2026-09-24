export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
