'use client';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export function SubmissionCardSkeleton() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Loading...</Typography>
      </Stack>
    </Box>
  );
}
