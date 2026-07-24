'use client';

import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

interface QueryFeedbackProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
}

export function QueryFeedback({
  isLoading,
  isError,
  errorMessage,
  isEmpty = false,
  emptyMessage = 'No results found.',
  onRetry,
  children,
}: PropsWithChildren<QueryFeedbackProps>) {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        {errorMessage ?? 'Something went wrong while loading data.'}
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <Stack alignItems="center" spacing={1} py={6}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Stack>
    );
  }

  return <>{children}</>;
}
