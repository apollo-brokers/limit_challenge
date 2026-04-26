'use client';

import { Suspense } from 'react';
import { CircularProgress, Container, Box } from '@mui/material';
import SubmissionsClient from './SubmissionsClient';

export default function SubmissionsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" alignItems="center" p={10}>
            <CircularProgress />
          </Box>
        }
      >
        <SubmissionsClient />
      </Suspense>
    </Container>
  );
}
