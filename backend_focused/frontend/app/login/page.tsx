import { connection } from 'next/server';
import { Suspense } from 'react';
import { PageSpinner } from '@/components/query-state';
import LoginForm from './login-form';

export default async function LoginPage() {
  // Rendered per request so a later client navigation to plain `/login` (logout) does not restore
  // an old `?next=` or `?reason=expired` from the first page load.
  await connection();
  return (
    <Suspense fallback={<PageSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
