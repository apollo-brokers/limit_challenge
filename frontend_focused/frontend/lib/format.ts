import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

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

export function formatStatus(status: SubmissionStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatPriority(priority: SubmissionPriority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(value);
}
