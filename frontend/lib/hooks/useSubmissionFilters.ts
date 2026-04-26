import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SubmissionStatus, SubmissionListFilters } from '@/lib/types';

/**
 * Custom hook to manage synchronization between the browser URL and the active submission filters.
 */
export function useSubmissionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  /**
   * Pushes a new query parameter to the Next.js router.
   * Modifying ANY filter intentionally resets the page to 1.
   */
  const updateFilter = useCallback(
    (key: keyof SubmissionListFilters, value: string | boolean | number | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // If we are updating a filter (not pagination), reset back to page 1.
      if (key !== 'page') {
        params.delete('page');
      }

      if (value !== undefined && value !== '' && value !== false) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
      
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // Compute current active filters directly mapped from URL
  const filters: SubmissionListFilters = useMemo(
    () => ({
      status: (searchParams.get('status') as SubmissionStatus) || undefined,
      brokerId: searchParams.get('brokerId') || undefined,
      companySearch: searchParams.get('companySearch') || undefined,
      createdFrom: searchParams.get('createdFrom') || undefined,
      createdTo: searchParams.get('createdTo') || undefined,
      hasDocuments: searchParams.get('hasDocuments') === 'true' || undefined,
      hasNotes: searchParams.get('hasNotes') === 'true' || undefined,
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
    }),
    [searchParams],
  );

  return { filters, updateFilter };
}
