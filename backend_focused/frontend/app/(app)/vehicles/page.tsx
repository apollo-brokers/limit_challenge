import { connection } from 'next/server';
import { Suspense } from 'react';
import { PageSpinner } from '@/components/query-state';
import VehiclesView from './vehicles-view';

export default async function VehiclesPage() {
  // Render per request so the client router keys this page by its query string. A prerendered
  // page is cached without it, and a later link to plain `/vehicles` would restore an old query.
  await connection();
  return (
    <Suspense fallback={<PageSpinner />}>
      <VehiclesView />
    </Suspense>
  );
}
