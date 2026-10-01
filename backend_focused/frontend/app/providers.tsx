'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { PropsWithChildren, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { FeedbackProvider } from '@/components/feedback-provider';
import { NavigationProgress } from '@/components/navigation-progress';
import { theme } from '@/theme';

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (attempt, error) => {
              if (isAxiosError(error) && error.response && error.response.status < 500)
                return false;
              return attempt < 1;
            },
          },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NavigationProgress />
        <FeedbackProvider>{children}</FeedbackProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
