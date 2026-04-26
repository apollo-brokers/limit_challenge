'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PropsWithChildren, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/lib/theme-types';
import { SUBMISSION_COLOR_MAPPINGS } from '@/lib/theme-types';

function useTheme() {
  return useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: '#0f62fe',
          },
          background: {
            default: '#f5f7fb',
          },
        },
        shape: { borderRadius: 8 },
        submissionColorMappings: SUBMISSION_COLOR_MAPPINGS,
        heroGradient: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
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
