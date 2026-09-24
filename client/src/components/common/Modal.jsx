import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-md border border-line bg-panel shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-slate hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
