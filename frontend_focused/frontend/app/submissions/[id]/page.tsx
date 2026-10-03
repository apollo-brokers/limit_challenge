import { Suspense } from 'react';

import { SubmissionDetailView } from '@/components/submissions/SubmissionDetailView';

function DetailFallback() {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 24px',
        color: '#64748b',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      Loading submission…
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
