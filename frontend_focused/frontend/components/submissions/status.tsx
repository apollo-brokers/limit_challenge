import { Chip } from '@mui/material';

import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

const STATUS_COLORS: Record<
  SubmissionStatus,
  'default' | 'info' | 'success' | 'warning' | 'error'
> = {
  new: 'info',
  in_review: 'warning',
  closed: 'success',
  lost: 'default',
};

const PRIORITY_COLORS: Record<SubmissionPriority, 'error' | 'warning' | 'default'> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  closed: 'Closed',
  lost: 'Lost',
};

const PRIORITY_LABELS: Record<SubmissionPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function StatusChip({ status }: { status: SubmissionStatus }) {
  return (
    <Chip
      size="small"
      label={STATUS_LABELS[status]}
      color={STATUS_COLORS[status]}
      variant="outlined"
      sx={{ bgcolor: 'background.paper' }}
    />
  );
}

export function PriorityChip({ priority }: { priority: SubmissionPriority }) {
  return (
    <Chip
      size="small"
      label={PRIORITY_LABELS[priority]}
      color={PRIORITY_COLORS[priority]}
      variant="filled"
      sx={{ color: priority === 'low' ? 'text.primary' : undefined }}
    />
  );
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
