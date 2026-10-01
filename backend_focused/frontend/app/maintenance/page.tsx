import { Suspense } from 'react';
import { QueryState } from '@/components/query-state';
import { MaintenanceScreen } from './components/maintenance-screen';

export default function MaintenancePage() {
  return (
    <Suspense fallback={<QueryState isPending isError={false} />}>
      <MaintenanceScreen />
    </Suspense>
  );
}
