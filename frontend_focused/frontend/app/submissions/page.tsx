import { Suspense } from 'react';

import { SubmissionsWorkspace } from '@/components/submissions/SubmissionsWorkspace';

function SubmissionsFallback() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <p style={{ color: '#5f6b7a' }}>Loading submissions…</p>
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
