'use client';

import CircleIcon from '@mui/icons-material/Circle';
import { Chip, alpha } from '@mui/material';

import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

const STATUS_META: Record<
  SubmissionStatus,
  { label: string; color: string; bg: string }
> = {
  new: { label: 'New', color: '#0369A1', bg: '#E0F2FE' },
  in_review: { label: 'In Review', color: '#B45309', bg: '#FEF3C7' },
  closed: { label: 'Closed', color: '#15803D', bg: '#DCFCE7' },
  lost: { label: 'Lost', color: '#475569', bg: '#F1F5F9' },
};

const PRIORITY_META: Record<
  SubmissionPriority,
  { label: string; color: string; bg: string }
> = {
  high: { label: 'High', color: '#B91C1C', bg: '#FEE2E2' },
  medium: { label: 'Medium', color: '#B45309', bg: '#FEF3C7' },
  low: { label: 'Low', color: '#475569', bg: '#F1F5F9' },
};

export function StatusChip({ status }: { status: SubmissionStatus }) {
  const meta = STATUS_META[status];

  return (
    <Chip
      size="small"
      icon={
        <CircleIcon
          aria-hidden
          sx={{ fontSize: '8px !important', color: `${meta.color} !important` }}
        />
      }
      label={meta.label}
      sx={{
        bgcolor: meta.bg,
        color: meta.color,
        border: '1px solid',
        borderColor: alpha(meta.color, 0.18),
        '& .MuiChip-icon': { ml: 0.75 },
      }}
    />
  );
}

export function PriorityChip({ priority }: { priority: SubmissionPriority }) {
  const meta = PRIORITY_META[priority];

  return (
    <Chip
      size="small"
      icon={
        <CircleIcon
          aria-hidden
          sx={{ fontSize: '8px !important', color: `${meta.color} !important` }}
        />
      }
      label={meta.label}
      aria-label={`Priority: ${meta.label}`}
      sx={{
        bgcolor: meta.bg,
        color: meta.color,
        border: '1px solid',
        borderColor: alpha(meta.color, 0.18),
        '& .MuiChip-icon': { ml: 0.75 },
      }}
    />
  );
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
