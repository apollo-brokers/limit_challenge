'use client';

import {
  Alert,
  Button,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

interface SubmissionListStatesProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
}

export function SubmissionListSkeleton() {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={56} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );
}

export function SubmissionListStates({
  isLoading,
  isError,
  isEmpty,
  onRetry,
}: SubmissionListStatesProps) {
  if (isLoading) {
    return <SubmissionListSkeleton />;
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        variant="outlined"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        Could not load submissions. Check that the API is running and try again.
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <Paper
        variant="outlined"
        sx={{
          py: 6,
          px: 3,
          textAlign: 'center',
          bgcolor: 'grey.50',
          borderStyle: 'dashed',
        }}
      >
        <Typography variant="h6" gutterBottom>
          No submissions match
        </Typography>
        <Typography color="text.secondary" maxWidth={420} mx="auto">
          Try clearing filters or broadening your company search to see more opportunities.
        </Typography>
      </Paper>
    );
  }

  return null;
}
