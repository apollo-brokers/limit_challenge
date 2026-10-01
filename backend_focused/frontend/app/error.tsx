'use client';

import { Alert, Button, Stack, Typography } from '@mui/material';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Stack gap={2}>
      <Typography variant="h1">Unable to open this page</Typography>
      <Alert severity="error">An unexpected error occurred. Try opening the page again.</Alert>
      <Button onClick={reset}>Try again</Button>
    </Stack>
  );
}
