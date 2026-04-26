'use client';

import { Box, Container, Stack, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionStatus } from '@/lib/types';
import { SubmissionsFilters, SubmissionsList } from '@/app/components';

export default function SubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') || '';
  const brokerId = searchParams.get('brokerId') || '';
  const companyQuery = searchParams.get('companySearch') || '';
  const hasDocuments = searchParams.get('hasDocuments') || '';
  const hasNotes = searchParams.get('hasNotes') || '';
  const createdFrom = searchParams.get('createdFrom') || '';
  const createdTo = searchParams.get('createdTo') || '';
  const page = searchParams.get('page') || '1';

  const [companySearchInput, setCompanySearchInput] = useState(companyQuery);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== 'page') {
      params.delete('page');
    }

    router.push(`/submissions?${params.toString()}`);
  };

  const filters = useMemo(
    () => ({
      status: (status as SubmissionStatus) || undefined,
      brokerId: brokerId || undefined,
      companySearch: companyQuery || undefined,
      hasDocuments: hasDocuments || undefined,
      hasNotes: hasNotes || undefined,
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      page,
    }),
    [status, brokerId, companyQuery, hasDocuments, hasNotes, createdFrom, createdTo, page],
  );

  // Debounce company search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (companySearchInput !== companyQuery) {
        updateFilter('companySearch', companySearchInput);
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySearchInput]);

  // Update local input when URL changes (e.g., from back button)
  useEffect(() => {
    setCompanySearchInput(companyQuery);
  }, [companyQuery]);

  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();

  const submissionQueryData = submissionsQuery.data;
  const brokerQueryData = brokerQuery.data;

  const selectedBroker = useMemo(
    () => brokerQueryData?.results?.find((broker) => String(broker.id) === brokerId) ?? null,
    [brokerQueryData?.results, brokerId],
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 6 }, px: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ mb: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            Submissions
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Use the filters below to search and organize submissions by status, broker, or company.
          </Typography>
        </Box>

        {/* Filters and List Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', lg: '300px 1fr' },
            gap: 2,
          }}
        >
          {/* Filters - Left Column */}
          <SubmissionsFilters
            status={status}
            companySearchInput={companySearchInput}
            hasDocuments={hasDocuments}
            hasNotes={hasNotes}
            createdFrom={createdFrom}
            createdTo={createdTo}
            updateFilter={updateFilter}
            setCompanySearchInput={setCompanySearchInput}
            brokerQuery={brokerQuery}
            brokerQueryData={brokerQueryData}
            selectedBroker={selectedBroker}
          />

          {/* List Section - Right Column */}
          <SubmissionsList
            page={page}
            submissionsQuery={submissionsQuery}
            submissionQueryData={submissionQueryData}
            updateFilter={updateFilter}
          />
        </Box>
      </Stack>
    </Container>
  );
}
