import { Suspense } from 'react';

import { SubmissionsWorkspace } from '@/components/submissions/SubmissionsWorkspace';

function SubmissionsFallback() {
  return (
    <div
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '32px 24px',
        color: '#64748b',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      Loading submissions…
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<SubmissionsFallback />}>
      <SubmissionsWorkspace />
    </Suspense>
  );
}
