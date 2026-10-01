'use client';

import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { PageSpinner } from '@/components/query-state';
import { clearTokens, loginPath, useHasSession } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/maintenance-due', label: 'Maintenance due' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const hasSession = useHasSession();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hasSession === false) {
      router.replace(loginPath(window.location.pathname + window.location.search));
    }
  }, [hasSession, router]);

  function logout() {
    clearTokens();
    queryClient.clear();
    router.replace('/login');
  }

  if (!hasSession) return <PageSpinner />;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            component={Link}
            href="/vehicles"
            variant="h6"
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              mr: 2,
              // The "Vehicles" button links to the same page, so phones keep only the nav.
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Fleet Maintenance
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color={active ? 'primary' : 'inherit'}
                  sx={{ fontWeight: active ? 600 : 400 }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
          <Button color="inherit" onClick={logout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
