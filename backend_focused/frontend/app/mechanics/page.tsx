import { Suspense } from 'react';
import { QueryState } from '@/components/query-state';
import { MechanicsPage } from './components/mechanics-page';

export default function Page() {
  return (
    <Suspense fallback={<QueryState isPending isError={false} />}>
      <MechanicsPage />
    </Suspense>
  );
}
