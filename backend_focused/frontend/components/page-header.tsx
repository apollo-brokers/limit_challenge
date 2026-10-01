'use client';

import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
  navigation,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  navigation?: ReactNode;
}) {
  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
      >
        <Box>
          <Typography variant="h1">{title}</Typography>
          {description && (
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
              {description}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
      {navigation}
    </Stack>
  );
}
