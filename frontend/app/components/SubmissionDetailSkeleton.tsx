'use client';

import { Box, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';

/**
 * Skeleton loader for submission detail page
 * Shows while detail data is being fetched
 */
export function SubmissionDetailSkeleton() {
  return (
    <Box sx={{ position: 'relative', minHeight: '70vh' }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary" variant="body1">
          Loading submission details...
        </Typography>
      </Box>

      {/* Skeleton Content */}
      <Stack spacing={4} sx={{ opacity: 0.5, pointerEvents: 'none' }}>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={1} flex={1}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="80%" height={24} />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 2 }}>
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
          </Stack>
        </Box>

        {/* Details Section 1 */}
        <Box>
          <Skeleton variant="text" width="20%" height={28} sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="95%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
          </Stack>
        </Box>

        {/* Details Section 2 */}
        <Box>
          <Skeleton variant="text" width="15%" height={28} sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="98%" height={20} />
          </Stack>
        </Box>

        {/* Details Section 3 */}
        <Box>
          <Skeleton variant="text" width="25%" height={28} sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="85%" height={20} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
