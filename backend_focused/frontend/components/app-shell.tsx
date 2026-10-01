'use client';

import { AppBar, Box, Container, Link, Toolbar, Typography } from '@mui/material';
import NextLink from 'next/link';
import { PropsWithChildren } from 'react';
import { FleetMascot } from '@/components/mascot/fleet-mascot';
import { MainNavigation } from '@/components/navigation/main-navigation';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 64 }}>
            <Typography
              component={NextLink}
              href="/vehicles"
              variant="h6"
              color="primary"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 750,
                textDecoration: 'none',
              }}
            >
              <FleetMascot size={44} />
              Fleet Tracker
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Fleet & maintenance
            </Typography>
            <Link
              href="#main-content"
              sx={{
                ml: 'auto',
                position: 'absolute',
                left: -10000,
                '&:focus': { position: 'static' },
              }}
            >
              Skip to content
            </Link>
          </Toolbar>
          <MainNavigation />
        </Container>
      </AppBar>
      <Box component="main" id="main-content" tabIndex={-1} sx={{ py: { xs: 3, md: 4 } }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </>
  );
}
