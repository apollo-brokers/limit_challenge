import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
};

export default function PageHeader({ title, subtitle, actions, back }: Props) {
  return (
    <Box sx={{ mb: 3 }}>
      {back && (
        <Button component={Link} href={back.href} size="small" sx={{ mb: 1, ml: -1 }}>
          ← {back.label}
        </Button>
      )}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Box>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" component="div">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
