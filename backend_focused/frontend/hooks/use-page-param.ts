'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';

export function usePageParam() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const value = Number(searchParams.get('page') ?? 1);
  const page = Number.isSafeInteger(value) && value > 0 ? value : 1;
  function setPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete('page');
    else params.set('page', String(next));
    router.push(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false });
  }
  return { page, setPage };
}
