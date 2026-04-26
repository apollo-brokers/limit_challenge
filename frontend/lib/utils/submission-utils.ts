import { SubmissionStatus, StatusColorType, PriorityColorType } from '@/lib/types';

export const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

export const getStatusColor = (
  status: SubmissionStatus,
  statusColorMap: Record<string, StatusColorType>,
): StatusColorType | 'default' => {
  return (statusColorMap[status] || 'default') as StatusColorType | 'default';
};

export const getStatusLabel = (status: SubmissionStatus) => {
  const option = STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label;
};

export const getPriorityColor = (
  priority: string,
  priorityColorMap: Record<string, PriorityColorType>,
): PriorityColorType | 'default' => {
  return (priorityColorMap[priority] || 'default') as PriorityColorType | 'default';
};
