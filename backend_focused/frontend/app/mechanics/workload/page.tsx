import { Suspense } from 'react';
import { QueryState } from '@/components/query-state';
import { MechanicWorkloadScreen } from './components/mechanic-workload-screen';

export default function MechanicWorkloadPage() {
  return (
    <Suspense fallback={<QueryState isPending isError={false} />}>
      <MechanicWorkloadScreen />
    </Suspense>
  );
}
