'use client';

import { Alert, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { getErrorMessage } from '@/lib/form-errors';

export function QueryState({
  isPending,
  isError,
  error,
  onRetry,
}: {
  isPending: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
}) {
  if (isPending)
    return (
      <Stack gap={1} sx={{ py: 3 }} role="status">
        <LinearProgress aria-label="Loading records" />
        <Typography variant="body2" color="text.secondary">
          Loading records…
        </Typography>
      </Stack>
    );
  if (isError)
    return (
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        {getErrorMessage(error)}
      </Alert>
    );
  return null;
}
