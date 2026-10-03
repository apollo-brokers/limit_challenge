'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { CssBaseline, ThemeProvider, createTheme, alpha } from '@mui/material';
import { PropsWithChildren, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FeedbackProvider } from '@/components/ui/FeedbackProvider';

const fontStack = 'var(--font-geist-sans), system-ui, -apple-system, Segoe UI, sans-serif';

const palette = {
  primary: '#0F6B6B',
  primaryDark: '#0A4F4F',
  primaryLight: '#1A8A8A',
  secondary: '#1E3A5F',
  bg: '#F4F6F8',
  paper: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  divider: '#E2E8F0',
  hover: '#F1F5F9',
};

function useTheme() {
  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: palette.primary,
            dark: palette.primaryDark,
            light: palette.primaryLight,
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: palette.secondary,
            contrastText: '#FFFFFF',
          },
          background: {
            default: palette.bg,
            paper: palette.paper,
          },
          text: {
            primary: palette.text,
            secondary: palette.textMuted,
          },
          divider: palette.divider,
          success: { main: '#15803D' },
          warning: { main: '#B45309' },
          error: { main: '#B91C1C' },
          info: { main: '#0369A1' },
          action: {
            hover: palette.hover,
            selected: alpha(palette.primary, 0.08),
            focus: alpha(palette.primary, 0.12),
            disabled: alpha(palette.text, 0.38),
          },
        },
        shape: { borderRadius: 10 },
        spacing: 8,
        typography: {
          fontFamily: fontStack,
          h3: {
            fontWeight: 700,
            letterSpacing: '-0.025em',
            fontSize: '2rem',
            lineHeight: 1.2,
          },
          h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontSize: '1.625rem',
            lineHeight: 1.25,
          },
          h5: {
            fontWeight: 600,
            letterSpacing: '-0.015em',
            fontSize: '1.25rem',
            lineHeight: 1.3,
          },
          h6: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
            fontSize: '1.0625rem',
            lineHeight: 1.35,
          },
          subtitle1: { fontWeight: 600, letterSpacing: '-0.01em' },
          subtitle2: { fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.01em' },
          body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
          body2: { fontSize: '0.875rem', lineHeight: 1.5 },
          caption: { fontSize: '0.75rem', lineHeight: 1.4, color: palette.textMuted },
          button: { fontWeight: 600, letterSpacing: 0 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: palette.bg,
                scrollbarColor: `${palette.divider} transparent`,
              },
            },
          },
          MuiAppBar: {
            defaultProps: { elevation: 0, color: 'inherit' },
            styleOverrides: {
              root: {
                backgroundColor: alpha(palette.paper, 0.92),
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${palette.divider}`,
                color: palette.text,
              },
            },
          },
          MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: {
                border: `1px solid ${palette.divider}`,
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                backgroundImage: 'none',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              outlined: {
                borderColor: palette.divider,
              },
            },
          },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
                paddingInline: 16,
              },
              sizeSmall: {
                paddingInline: 12,
                fontSize: '0.8125rem',
              },
              sizeLarge: {
                paddingBlock: 10,
                paddingInline: 20,
                fontSize: '0.9375rem',
              },
              outlined: {
                borderColor: palette.divider,
                backgroundColor: palette.paper,
                '&:hover': {
                  borderColor: alpha(palette.primary, 0.4),
                  backgroundColor: alpha(palette.primary, 0.04),
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                transition: 'background-color 0.15s ease, color 0.15s ease',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                borderRadius: 6,
              },
              sizeSmall: {
                height: 24,
                fontSize: '0.75rem',
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: palette.paper,
                transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(palette.primary, 0.35),
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 3px ${alpha(palette.primary, 0.12)}`,
                },
              },
              notchedOutline: {
                borderColor: palette.divider,
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: palette.textMuted,
                  backgroundColor: '#F8FAFC',
                  borderBottomColor: palette.divider,
                  whiteSpace: 'nowrap',
                },
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottomColor: palette.divider,
                paddingTop: 14,
                paddingBottom: 14,
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.12s ease',
                '&:last-child td': { borderBottom: 0 },
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
              outlined: {
                backgroundColor: palette.paper,
              },
            },
          },
          MuiPaginationItem: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                borderRadius: 8,
              },
            },
          },
          MuiSkeleton: {
            styleOverrides: {
              root: {
                backgroundColor: alpha(palette.text, 0.06),
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: '0.75rem',
                fontWeight: 500,
                backgroundColor: palette.secondary,
              },
            },
          },
          MuiLink: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                textUnderlineOffset: 3,
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: palette.divider,
              },
            },
          },
        },
      }),
    [],
  );
}

export default function Providers({ children }: PropsWithChildren) {
  const theme = useTheme();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppRouterCacheProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <FeedbackProvider>{children}</FeedbackProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AppRouterCacheProvider>
  );
}
