import { statusLabel } from '../../utils/formatters';

const STATUS_STYLES = {
  open: 'bg-info-soft text-info',
  quoted: 'bg-accent-soft text-accent-deep',
  booked: 'bg-info-soft text-info',
  scheduled: 'bg-info-soft text-info',
  en_route: 'bg-warning-soft text-warning',
  in_progress: 'bg-warning-soft text-warning',
  completed: 'bg-success-soft text-success',
  closed: 'bg-success-soft text-success',
  cancelled: 'bg-line text-slate',
  disputed: 'bg-danger-soft text-danger',
  pending: 'bg-warning-soft text-warning',
  accepted: 'bg-success-soft text-success',
  rejected: 'bg-danger-soft text-danger',
  withdrawn: 'bg-line text-slate',
  approved: 'bg-success-soft text-success',
  open_dispute: 'bg-danger-soft text-danger',
  in_review: 'bg-warning-soft text-warning',
  resolved: 'bg-success-soft text-success',
  escalated: 'bg-danger-soft text-danger',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-line text-slate';
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-xs ${style}`}>
      {statusLabel(status)}
    </span>
  );
}
