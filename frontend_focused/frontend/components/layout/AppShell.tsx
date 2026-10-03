'use client';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {
  AppBar,
  Box,
  Container,
  Stack,
  Toolbar,
  Typography,
  alpha,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl';
}

export function AppShell({ children, maxWidth = 'xl' }: AppShellProps) {
  const pathname = usePathname();
  const onSubmissions = pathname.startsWith('/submissions');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Toolbar
          sx={{
            gap: { xs: 1.5, sm: 3 },
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
          }}
        >
          <Stack
            component={Link}
            href="/submissions"
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{
              color: 'text.primary',
              textDecoration: 'none',
              minWidth: 0,
              '&:hover .brand-mark': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <Box
              className="brand-mark"
              aria-hidden
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                transition: 'background-color 0.15s ease',
              }}
            >
              <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box minWidth={0}>
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ display: 'block', lineHeight: 1.2, fontWeight: 700 }}
              >
                Submission Tracker
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}
              >
                Operations workspace
              </Typography>
            </Box>
          </Stack>

          <Box
            component="nav"
            aria-label="Primary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: { xs: 'auto', sm: 0 } }}
          >
            <Box
              component={Link}
              href="/submissions"
              aria-current={onSubmissions ? 'page' : undefined}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: onSubmissions ? 'primary.main' : 'text.secondary',
                bgcolor: onSubmissions ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                },
              }}
            >
              Submissions
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={maxWidth}
        component="main"
        sx={{
          flex: 1,
          py: { xs: 2.5, md: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
