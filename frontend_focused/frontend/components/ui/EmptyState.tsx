'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      role="status"
      sx={{
        py: { xs: 5, md: 7 },
        px: 3,
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'rgba(15, 23, 42, 0.015)',
      }}
    >
      <Stack spacing={1.5} alignItems="center" maxWidth={420} mx="auto">
        {icon ? (
          <Box
            aria-hidden
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'action.selected',
              color: 'primary.main',
              mb: 0.5,
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Typography variant="h6" component="p">
          {title}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
        {actionLabel && onAction ? (
          <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
