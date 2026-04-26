'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Button,
  Chip,
  useTheme,
  Autocomplete,
} from '@mui/material';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionStatus } from '@/lib/types';
import {
  STATUS_OPTIONS,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
} from '@/lib/utils/submission-utils';
import { SubmissionsPagination } from '@/app/components/SubmissionsPagination';
import { SubmissionCardSkeleton } from '@/app/components/SubmissionCardSkeleton';
import { ApiErrorState } from '@/app/components/ApiErrorState';

export default function SubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const status = searchParams.get('status') || '';
  const brokerId = searchParams.get('brokerId') || '';
  const companyQuery = searchParams.get('companySearch') || '';
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
      page,
    }),
    [status, brokerId, companyQuery, page],
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1">
            Submissions
          </Typography>
          <Typography color="text.secondary">
            Use the filters below to search and organize submissions by status, broker, or company.
          </Typography>
        </Box>

        {/* Filters */}
        <Box display="flex" justifyContent="flex-end">
          <Button variant="outlined" size="small" onClick={() => router.push('/submissions')}>
            Clear filters
          </Button>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => updateFilter('status', e.target.value)}
                fullWidth
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <Autocomplete
                options={brokerQueryData?.results ?? []}
                getOptionLabel={(option) => (typeof option === 'string' ? '' : option.name)}
                value={selectedBroker}
                onChange={(event, newValue) => {
                  updateFilter('brokerId', newValue ? String(newValue.id) : '');
                }}
                loading={brokerQuery.isLoading}
                disabled={brokerQuery.isLoading || brokerQuery.isError}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Broker"
                    error={brokerQuery.isError}
                    helperText={
                      brokerQuery.isError
                        ? 'Failed to load brokers. Try again.'
                        : brokerQuery.isLoading
                          ? 'Loading brokers...'
                          : ''
                    }
                  />
                )}
                fullWidth
              />

              <TextField
                label="Company search"
                value={companySearchInput}
                onChange={(e) => setCompanySearchInput(e.target.value)}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        {/* List Section */}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Submission list ({submissionQueryData?.count ?? 0})
                </Typography>
                <SubmissionsPagination
                  page={page}
                  totalCount={submissionQueryData?.count}
                  hasPrevious={!!submissionQueryData?.previous}
                  hasNext={!!submissionQueryData?.next}
                  onPreviousClick={() => updateFilter('page', String(Number(page) - 1))}
                  onNextClick={() => updateFilter('page', String(Number(page) + 1))}
                  onPageClick={(pageNumber) => updateFilter('page', String(pageNumber))}
                />
              </Box>

              <Divider />

              {/* Loading */}
              {(submissionsQuery.isLoading || submissionsQuery.isFetching) && (
                <SubmissionCardSkeleton />
              )}

              {/* Error */}
              {submissionsQuery.error && <ApiErrorState entityName="submissions" />}

              {/* Empty */}
              {!submissionsQuery.isLoading && (submissionQueryData?.results?.length ?? 0) === 0 && (
                <Typography>No submissions found</Typography>
              )}

              {/* List */}
              {!submissionsQuery.isLoading &&
                submissionQueryData?.results?.map((item, index) => (
                  <Card
                    key={item.id}
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        index % 2 === 0
                          ? theme?.submissionColorMappings?.alternatingRowBackground
                          : 'transparent',
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{item.company.legalName}</Typography>

                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary">
                                Status:
                              </Typography>
                              <Chip
                                label={getStatusLabel(item.status)}
                                color={getStatusColor(
                                  item.status,
                                  theme.submissionColorMappings.status,
                                )}
                                size="small"
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary">
                                Priority:
                              </Typography>
                              <Chip
                                label={item.priority.toUpperCase()}
                                color={getPriorityColor(
                                  item.priority,
                                  theme.submissionColorMappings.priority,
                                )}
                                size="small"
                              />
                            </Box>
                          </Stack>
                        </Box>

                        <Typography color="text.secondary">
                          Broker: {item.broker.name} | Owner: {item.owner.fullName}
                        </Typography>

                        <Typography>{item.summary}</Typography>

                        <Typography color="text.secondary">
                          Docs: {item.documentCount} | Notes: {item.noteCount}
                        </Typography>

                        {item.latestNote && (
                          <Box>
                            <Typography variant="subtitle2">Latest:</Typography>
                            <Typography color="text.secondary">
                              {item.latestNote.bodyPreview}
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          <Link href={`/submissions/${item.id}`}>
                            <Button size="small">View Details →</Button>
                          </Link>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}

              <SubmissionsPagination
                page={page}
                totalCount={submissionQueryData?.count}
                hasPrevious={!!submissionQueryData?.previous}
                hasNext={!!submissionQueryData?.next}
                onPreviousClick={() => updateFilter('page', String(Number(page) - 1))}
                onNextClick={() => updateFilter('page', String(Number(page) + 1))}
                onPageClick={(pageNumber) => updateFilter('page', String(pageNumber))}
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
