import { ChipProps } from '@mui/material';

import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

export const statusPresentation: Record<
  SubmissionStatus,
  { label: string; color: ChipProps['color'] }
> = {
  new: { label: 'New', color: 'info' },
  in_review: { label: 'In Review', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
  lost: { label: 'Lost', color: 'default' },
};

export const priorityPresentation: Record<
  SubmissionPriority,
  { label: string; color: ChipProps['color'] }
> = {
  high: { label: 'High priority', color: 'error' },
  medium: { label: 'Medium priority', color: 'warning' },
  low: { label: 'Low priority', color: 'success' },
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
