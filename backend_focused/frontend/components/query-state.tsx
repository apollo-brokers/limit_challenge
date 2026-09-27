'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { parseApiError } from '@/lib/api-errors';

export function PageSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

/** Placeholder table rows shown while the first page loads. */
export function LoadingRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <TableRow key={row}>
          {Array.from({ length: columns }, (_, column) => (
            <TableCell key={column}>
              <Skeleton />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/** Error banner for a failed request. Renders nothing when the error has no general message. */
export function ErrorAlert({
  error,
  fields,
  onRetry,
}: {
  error: unknown;
  fields?: Record<string, string>;
  onRetry?: () => void;
}) {
  const { message } = parseApiError(error, fields);
  if (!message) return null;
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      {message}
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="subtitle1">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
