'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { AppShell } from '@/components/layout/AppShell';
import {
  SubmissionFilterValues,
  SubmissionFilters,
} from '@/components/submissions/SubmissionFilters';
import { SubmissionListStates } from '@/components/submissions/SubmissionListStates';
import { SubmissionPagination } from '@/components/submissions/SubmissionPagination';
import { SubmissionTable } from '@/components/submissions/SubmissionTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionListFilters, SubmissionPriority, SubmissionStatus } from '@/lib/types';

function parseFilters(searchParams: URLSearchParams): SubmissionFilterValues & { page: number } {
  const pageRaw = Number(searchParams.get('page') || '1');
  return {
    status: (searchParams.get('status') as SubmissionStatus | null) || '',
    brokerId: searchParams.get('brokerId') || '',
    companySearch: searchParams.get('companySearch') || '',
    priority: (searchParams.get('priority') as SubmissionPriority | null) || '',
    createdFrom: searchParams.get('createdFrom') || '',
    createdTo: searchParams.get('createdTo') || '',
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

export function SubmissionsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const parsed = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(parsed.priority || parsed.createdFrom || parsed.createdTo),
  );

  const filterValues: SubmissionFilterValues = useMemo(
    () => ({
      status: parsed.status,
      brokerId: parsed.brokerId,
      companySearch: parsed.companySearch,
      priority: parsed.priority,
      createdFrom: parsed.createdFrom,
      createdTo: parsed.createdTo,
    }),
    [parsed],
  );

  const queryFilters: SubmissionListFilters = useMemo(
    () => ({
      status: parsed.status || undefined,
      brokerId: parsed.brokerId || undefined,
      companySearch: parsed.companySearch || undefined,
      priority: parsed.priority || undefined,
      createdFrom: parsed.createdFrom || undefined,
      createdTo: parsed.createdTo || undefined,
      page: parsed.page,
    }),
    [parsed],
  );

  const submissionsQuery = useSubmissionsList(queryFilters);

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (parsed.page <= 1 || !submissionsQuery.isError) {
      return;
    }

    const isInvalidPage =
      axios.isAxiosError(submissionsQuery.error) &&
      submissionsQuery.error.response?.status === 404;

    if (!isInvalidPage) {
      return;
    }

    replaceParams((params) => {
      params.delete('page');
    });
  }, [
    parsed.page,
    replaceParams,
    submissionsQuery.error,
    submissionsQuery.isError,
  ]);

  const handleFilterChange = useCallback(
    (next: Partial<SubmissionFilterValues>) => {
      replaceParams((params) => {
        (Object.entries(next) as Array<[keyof SubmissionFilterValues, string | undefined]>).forEach(
          ([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
          },
        );
        params.delete('page');
      });
    },
    [replaceParams],
  );

  const handleClear = useCallback(() => {
    replaceParams((params) => {
      [
        'status',
        'brokerId',
        'companySearch',
        'priority',
        'createdFrom',
        'createdTo',
        'page',
      ].forEach((key) => params.delete(key));
    });
  }, [replaceParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      replaceParams((params) => {
        if (page <= 1) params.delete('page');
        else params.set('page', String(page));
      });
    },
    [replaceParams],
  );

  const handleRetry = useCallback(() => {
    void submissionsQuery.refetch();
  }, [submissionsQuery.refetch]);

  const isInvalidPageError =
    submissionsQuery.isError &&
    parsed.page > 1 &&
    axios.isAxiosError(submissionsQuery.error) &&
    submissionsQuery.error.response?.status === 404;

  const rows = submissionsQuery.data?.results ?? [];
  const count = submissionsQuery.data?.count ?? 0;
  const showSkeleton =
    (submissionsQuery.isLoading && !submissionsQuery.data) || isInvalidPageError;
  const showListError = submissionsQuery.isError && !isInvalidPageError;
  const showEmpty =
    !submissionsQuery.isLoading && !showListError && rows.length === 0;
  const queryString = searchParams.toString();
  const isFetchingMore = submissionsQuery.isFetching && !showSkeleton;

  return (
    <AppShell>
      <Stack spacing={3}>
        <PageHeader
          title="Submissions"
          description="Review broker-submitted opportunities, filter by business context, and open a record for contacts, documents, and notes."
        />

        <SectionCard>
          <SubmissionFilters
            values={filterValues}
            onChange={handleFilterChange}
            onClear={handleClear}
            showAdvanced={showAdvanced}
            onToggleAdvanced={setShowAdvanced}
          />
        </SectionCard>

        <SectionCard>
          <Stack spacing={2.5}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
            >
              <Box>
                <Typography variant="h6" component="h2">
                  Results
                </Typography>
                {isFetchingMore ? (
                  <Typography variant="caption" color="text.secondary">
                    Updating…
                  </Typography>
                ) : null}
              </Box>
              {!showSkeleton && !showListError ? (
                <Chip
                  size="small"
                  label={`${count} submission${count === 1 ? '' : 's'}`}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ) : null}
            </Box>

            <SubmissionListStates
              isLoading={showSkeleton}
              isError={showListError}
              isEmpty={showEmpty}
              onRetry={handleRetry}
              onClearFilters={handleClear}
            />

            {!showSkeleton && !showListError && rows.length > 0 ? (
              <>
                <SubmissionTable rows={rows} queryString={queryString} />
                <SubmissionPagination
                  count={count}
                  page={parsed.page}
                  onPageChange={handlePageChange}
                />
              </>
            ) : null}
          </Stack>
        </SectionCard>
      </Stack>
    </AppShell>
  );
}
