'use client';

import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';

interface AppShellProps {
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg';
}

export function AppShell({ children, maxWidth = 'lg' }: AppShellProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
          <Typography
            component={Link}
            href="/submissions"
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Submission Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Operations workspace
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 5 } }}>
        {children}
      </Container>
    </Box>
  );
}
