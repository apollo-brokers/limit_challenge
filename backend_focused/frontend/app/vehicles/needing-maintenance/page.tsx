import { Suspense } from 'react';
import { QueryState } from '@/components/query-state';
import { NeedingMaintenanceScreen } from './components/needing-maintenance-screen';

export default function NeedingMaintenancePage() {
  return (
    <Suspense fallback={<QueryState isPending isError={false} />}>
      <NeedingMaintenanceScreen />
    </Suspense>
  );
}
