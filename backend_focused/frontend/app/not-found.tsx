'use client';

import { Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Stack gap={2} alignItems="flex-start">
      <Typography variant="h1">Page not found</Typography>
      <Typography color="text.secondary">The page you requested is not available.</Typography>
      <Button component={Link} href="/vehicles" variant="contained">
        Back to vehicles
      </Button>
    </Stack>
  );
}
