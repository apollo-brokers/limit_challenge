import { Suspense } from 'react';
import { QueryState } from '@/components/query-state';
import { OfficeSummaryScreen } from './components/office-summary-screen';

export default function OfficeSummaryPage() {
  return (
    <Suspense fallback={<QueryState isPending isError={false} />}>
      <OfficeSummaryScreen />
    </Suspense>
  );
}
