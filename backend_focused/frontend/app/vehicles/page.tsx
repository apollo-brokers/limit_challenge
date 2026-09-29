import { Suspense } from 'react';
import { QueryState } from '@/components/query-state';
import { VehiclesScreen } from './components/vehicles-screen';

export default function VehiclesPage() {
  return (
    <Suspense fallback={<QueryState isPending isError={false} />}>
      <VehiclesScreen />
    </Suspense>
  );
}
