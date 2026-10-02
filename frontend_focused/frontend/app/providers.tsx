'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PropsWithChildren, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const fontStack = 'var(--font-geist-sans), system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

function useTheme() {
  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#2563eb',
            dark: '#1d4ed8',
            light: '#60a5fa',
          },
          background: {
            default: '#f4f6fb',
            paper: '#ffffff',
          },
          text: {
            primary: '#0f172a',
            secondary: '#64748b',
          },
          divider: '#e2e8f0',
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: fontStack,
          h4: { fontWeight: 700, letterSpacing: '-0.02em' },
          h6: { fontWeight: 600, letterSpacing: '-0.01em' },
          subtitle2: { fontWeight: 600 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: '#f4f6fb',
              },
            },
          },
          MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: {
                border: '1px solid',
                borderColor: '#e2e8f0',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 10,
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  color: '#475569',
                  backgroundColor: '#f8fafc',
                  borderBottomColor: '#e2e8f0',
                },
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '&:last-child td': { borderBottom: 0 },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { fontWeight: 600 },
            },
          },
          MuiTextField: {
            defaultProps: {
              size: 'small',
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
