import { Chip } from '@mui/material';

import { formatPriority, formatStatus } from '@/lib/format';
import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

const STATUS_COLORS: Record<
  SubmissionStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  new: 'info',
  in_review: 'warning',
  closed: 'success',
  lost: 'error',
};

const PRIORITY_COLORS: Record<
  SubmissionPriority,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

export function StatusChip({ status }: { status: SubmissionStatus }) {
  return (
    <Chip
      label={formatStatus(status)}
      color={STATUS_COLORS[status]}
      size="small"
      variant="outlined"
    />
  );
}

export function PriorityChip({ priority }: { priority: SubmissionPriority }) {
  return (
    <Chip
      label={formatPriority(priority)}
      color={PRIORITY_COLORS[priority]}
      size="small"
      variant="filled"
    />
  );
}
