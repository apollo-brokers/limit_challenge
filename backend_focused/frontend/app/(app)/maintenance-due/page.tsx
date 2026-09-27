import { connection } from 'next/server';
import { Suspense } from 'react';
import { PageSpinner } from '@/components/query-state';
import MaintenanceDueView from './maintenance-due-view';

export default async function MaintenanceDuePage() {
  // Rendered per request for the same reason as the vehicles page: the query string must be part
  // of the client router cache key.
  await connection();
  return (
    <Suspense fallback={<PageSpinner />}>
      <MaintenanceDueView />
    </Suspense>
  );
}
