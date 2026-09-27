'use client';

import { Alert, CssBaseline, Snackbar, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, createContext, useCallback, useContext, useState } from 'react';
import { getErrorStatus } from '@/lib/api-errors';

const theme = createTheme({
  palette: {
    primary: { main: '#0f62fe' },
    background: { default: '#f5f7fb' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'var(--font-geist-sans), Roboto, Helvetica, Arial, sans-serif',
  },
});

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Client errors do not change on retry; network and server errors get one more try.
        retry: (failureCount, error) => {
          const status = getErrorStatus(error);
          if (status !== undefined && status < 500) return false;
          return failureCount < 1;
        },
      },
    },
  });
}

const NotifyContext = createContext<(message: string) => void>(() => {});

/** Return a function that shows a short success message at the bottom of the screen. */
export function useNotify() {
  return useContext(NotifyContext);
}

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const notify = useCallback((message: string) => setSnackbar({ open: true, message }), []);
  const close = () => setSnackbar((current) => ({ ...current, open: false }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotifyContext value={notify}>{children}</NotifyContext>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" onClose={close}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
