'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { AppShell } from '@/components/layout/AppShell';
import {
  SubmissionFilterValues,
  SubmissionFilters,
} from '@/components/submissions/SubmissionFilters';
import { SubmissionListStates } from '@/components/submissions/SubmissionListStates';
import { SubmissionPagination } from '@/components/submissions/SubmissionPagination';
import { SubmissionTable } from '@/components/submissions/SubmissionTable';
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

  const filterValues: SubmissionFilterValues = {
    status: parsed.status,
    brokerId: parsed.brokerId,
    companySearch: parsed.companySearch,
    priority: parsed.priority,
    createdFrom: parsed.createdFrom,
    createdTo: parsed.createdTo,
  };

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
        const merged = { ...filterValues, ...next };
        const entries: Array<[keyof SubmissionFilterValues, string]> = [
          ['status', merged.status],
          ['brokerId', merged.brokerId],
          ['companySearch', merged.companySearch],
          ['priority', merged.priority],
          ['createdFrom', merged.createdFrom],
          ['createdTo', merged.createdTo],
        ];

        for (const [key, value] of entries) {
          if (value) params.set(key, value);
          else params.delete(key);
        }
        params.delete('page');
      });
    },
    [filterValues, replaceParams],
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

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background:
              'linear-gradient(135deg, rgba(37, 99, 235, 0.09) 0%, rgba(37, 99, 235, 0.02) 55%, #ffffff 100%)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Submissions
          </Typography>
          <Typography color="text.secondary" maxWidth={640}>
            Review broker-submitted opportunities, filter by business context, and open a
            record for full contacts, documents, and notes.
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <SubmissionFilters
              values={filterValues}
              onChange={handleFilterChange}
              onClear={handleClear}
              showAdvanced={showAdvanced}
              onToggleAdvanced={setShowAdvanced}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="h6">Results</Typography>
                {!showSkeleton && !showListError ? (
                  <Chip
                    size="small"
                    label={`${count} submission${count === 1 ? '' : 's'}`}
                    variant="outlined"
                  />
                ) : null}
              </Box>

              <SubmissionListStates
                isLoading={showSkeleton}
                isError={showListError}
                isEmpty={showEmpty}
                onRetry={() => submissionsQuery.refetch()}
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
          </CardContent>
        </Card>
      </Stack>
    </AppShell>
  );
}
