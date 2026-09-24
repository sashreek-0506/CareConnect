export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
