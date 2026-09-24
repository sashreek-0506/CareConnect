import { formatDateTime, statusLabel } from '../../utils/formatters';

export default function BookingStatusTimeline({ timeline = [] }) {
  return (
    <ol className="space-y-4">
      {timeline.map((entry, idx) => (
        <li key={idx} className="relative pl-6">
          <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
          {idx < timeline.length - 1 && <span className="absolute left-[4px] top-4 h-full w-px bg-line" />}
          <p className="text-sm font-medium text-ink">{statusLabel(entry.status)}</p>
          <p className="text-xs text-slate">{formatDateTime(entry.timestamp)}</p>
          {entry.note && <p className="mt-1 text-sm text-slate">{entry.note}</p>}
          {entry.attachments && entry.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {entry.attachments.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-accent-deep underline">
                  Photo {i + 1}
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
