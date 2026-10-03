'use client';

import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  meta?: ReactNode;
}

export function PageHeader({ title, description, action, meta }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Stack spacing={0.75} minWidth={0}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" maxWidth={560} variant="body1">
            {description}
          </Typography>
        ) : null}
        {meta}
      </Stack>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Box>
  );
}
