import { Suspense } from 'react';
import { QueryState } from '@/components/query-state';
import { OfficesPage } from './components/offices-page';

export default function Page() {
  return (
    <Suspense fallback={<QueryState isPending isError={false} />}>
      <OfficesPage />
    </Suspense>
  );
}
