import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import Providers from './providers';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: { default: 'Fleet Tracker', template: '%s | Fleet Tracker' },
  description: 'Manage your fleet, offices, mechanics, and maintenance history.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
