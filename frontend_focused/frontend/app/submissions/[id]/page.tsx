import { Suspense } from 'react';

import { SubmissionDetailView } from '@/components/submissions/SubmissionDetailView';

function DetailFallback() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <p style={{ color: '#5f6b7a' }}>Loading submission…</p>
    </div>
  );
}

export default function SubmissionDetailPage() {
  return (
    <Suspense fallback={<DetailFallback />}>
      <SubmissionDetailView />
    </Suspense>
  );
}
