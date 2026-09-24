export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-sm border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}
