'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <Box
      role="status"
      sx={{
        py: { xs: 6, md: 8 },
        px: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(15, 118, 110, 0.08)',
          color: 'primary.main',
          mb: 0.5,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5" component="p">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
        {description}
      </Typography>
      {actionLabel && onAction ? (
        <Stack direction="row" sx={{ mt: 1.5 }}>
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}
