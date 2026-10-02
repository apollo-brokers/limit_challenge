'use client';

import dynamic from 'next/dynamic';
import { Box, Skeleton, Stack } from '@mui/material';

const FleetDashboard = dynamic(() => import('@/components/FleetDashboard'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          width: 248,
          display: { xs: 'none', md: 'block' },
          borderRight: '1px solid',
          borderColor: 'divider',
          p: 2.5,
          bgcolor: '#fff',
        }}
      >
        <Skeleton variant="rounded" width={160} height={36} />
        <Skeleton width={80} height={14} sx={{ mt: 4, mb: 2 }} />
        <Skeleton variant="rounded" height={52} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={52} />
      </Box>
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, maxWidth: 1280 }}>
        <Skeleton width={120} height={14} />
        <Skeleton width={220} height={36} sx={{ mt: 1, mb: 1 }} />
        <Skeleton width={360} height={18} />
        <Skeleton variant="rounded" height={160} sx={{ mt: 3, mb: 2 }} />
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </Stack>
      </Box>
    </Box>
  ),
});

export default function HomePage() {
  return <FleetDashboard />;
}
