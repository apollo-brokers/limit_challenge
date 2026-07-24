'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Container,
  Link as MuiLink,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { QueryFeedback } from '@/components/QueryFeedback';
import { PriorityChip, StatusChip } from '@/components/StatusChip';
import { formatDate, formatRelativeDate } from '@/lib/format';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const PAGE_SIZE = 10;

const TRISTATE_OPTIONS: { label: string; value: '' | 'true' | 'false' }[] = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function SubmissionsPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <SubmissionsPageContent />
    </Suspense>
  );
}

function SubmissionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<SubmissionStatus | ''>(
    () => (searchParams.get('status') as SubmissionStatus) || '',
  );
  const [brokerId, setBrokerId] = useState(() => searchParams.get('brokerId') ?? '');
  const [companyQuery, setCompanyQuery] = useState(() => searchParams.get('companySearch') ?? '');
  const [createdFrom, setCreatedFrom] = useState(() => searchParams.get('createdFrom') ?? '');
  const [createdTo, setCreatedTo] = useState(() => searchParams.get('createdTo') ?? '');
  const [hasDocuments, setHasDocuments] = useState<'' | 'true' | 'false'>(
    () => (searchParams.get('hasDocuments') as '' | 'true' | 'false') || '',
  );
  const [hasNotes, setHasNotes] = useState<'' | 'true' | 'false'>(
    () => (searchParams.get('hasNotes') as '' | 'true' | 'false') || '',
  );
  const [showMoreFilters, setShowMoreFilters] = useState(() =>
    Boolean(createdFrom || createdTo || hasDocuments || hasNotes),
  );
  const [page, setPage] = useState(() => Number(searchParams.get('page') ?? '1') || 1);

  const debouncedCompanySearch = useDebouncedValue(companyQuery, 400);

  const filters = useMemo(
    () => ({
      status: status || undefined,
      brokerId: brokerId || undefined,
      companySearch: debouncedCompanySearch || undefined,
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      hasDocuments: hasDocuments ? hasDocuments === 'true' : undefined,
      hasNotes: hasNotes ? hasNotes === 'true' : undefined,
      page: page > 1 ? page : undefined,
    }),
    [
      status,
      brokerId,
      debouncedCompanySearch,
      createdFrom,
      createdTo,
      hasDocuments,
      hasNotes,
      page,
    ],
  );

  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();

  const syncUrl = useCallback(
    (next: {
      status: string;
      brokerId: string;
      companySearch: string;
      createdFrom: string;
      createdTo: string;
      hasDocuments: string;
      hasNotes: string;
      page: number;
    }) => {
      const params = new URLSearchParams();
      if (next.status) params.set('status', next.status);
      if (next.brokerId) params.set('brokerId', next.brokerId);
      if (next.companySearch) params.set('companySearch', next.companySearch);
      if (next.createdFrom) params.set('createdFrom', next.createdFrom);
      if (next.createdTo) params.set('createdTo', next.createdTo);
      if (next.hasDocuments) params.set('hasDocuments', next.hasDocuments);
      if (next.hasNotes) params.set('hasNotes', next.hasNotes);
      if (next.page > 1) params.set('page', String(next.page));

      const query = params.toString();
      router.replace(query ? `/submissions?${query}` : '/submissions', { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    syncUrl({
      status,
      brokerId,
      companySearch: debouncedCompanySearch,
      createdFrom,
      createdTo,
      hasDocuments,
      hasNotes,
      page,
    });
  }, [
    status,
    brokerId,
    debouncedCompanySearch,
    createdFrom,
    createdTo,
    hasDocuments,
    hasNotes,
    page,
    syncUrl,
  ]);

  const handleStatusChange = (value: SubmissionStatus | '') => {
    setStatus(value);
    setPage(1);
  };

  const handleBrokerChange = (value: string) => {
    setBrokerId(value);
    setPage(1);
  };

  const handleCompanyChange = (value: string) => {
    setCompanyQuery(value);
    setPage(1);
  };

  const handleCreatedFromChange = (value: string) => {
    setCreatedFrom(value);
    setPage(1);
  };

  const handleCreatedToChange = (value: string) => {
    setCreatedTo(value);
    setPage(1);
  };

  const handleHasDocumentsChange = (value: '' | 'true' | 'false') => {
    setHasDocuments(value);
    setPage(1);
  };

  const handleHasNotesChange = (value: '' | 'true' | 'false') => {
    setHasNotes(value);
    setPage(1);
  };

  const hasAdvancedFilters = Boolean(createdFrom || createdTo || hasDocuments || hasNotes);

  const handleClearAdvancedFilters = () => {
    setCreatedFrom('');
    setCreatedTo('');
    setHasDocuments('');
    setHasNotes('');
    setPage(1);
  };

  const totalCount = submissionsQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const results = submissionsQuery.data?.results ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1">
            Submissions
          </Typography>
          <Typography color="text.secondary">
            Review incoming broker opportunities. Filters sync to the URL so you can share or
            bookmark a view.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(event) =>
                  handleStatusChange(event.target.value as SubmissionStatus | '')
                }
                fullWidth
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Broker"
                value={brokerId}
                onChange={(event) => handleBrokerChange(event.target.value)}
                fullWidth
                disabled={brokerQuery.isLoading}
                helperText={brokerQuery.isError ? 'Could not load brokers' : undefined}
              >
                <MenuItem value="">All brokers</MenuItem>
                {brokerQuery.data?.map((broker) => (
                  <MenuItem key={broker.id} value={String(broker.id)}>
                    {broker.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Company search"
                value={companyQuery}
                onChange={(event) => handleCompanyChange(event.target.value)}
                fullWidth
                placeholder="Search by name, industry, or city"
              />
            </Stack>

            <Box mt={1.5}>
              <Button
                size="small"
                onClick={() => setShowMoreFilters((prev) => !prev)}
                sx={{ textTransform: 'none' }}
              >
                {showMoreFilters ? 'Hide more filters ▲' : 'More filters ▼'}
                {hasAdvancedFilters && !showMoreFilters ? ' (active)' : ''}
              </Button>
            </Box>

            <Collapse in={showMoreFilters}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={2}>
                <TextField
                  label="Created from"
                  type="date"
                  value={createdFrom}
                  onChange={(event) => handleCreatedFromChange(event.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="Created to"
                  type="date"
                  value={createdTo}
                  onChange={(event) => handleCreatedToChange(event.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  select
                  label="Has documents"
                  value={hasDocuments}
                  onChange={(event) =>
                    handleHasDocumentsChange(event.target.value as '' | 'true' | 'false')
                  }
                  fullWidth
                >
                  {TRISTATE_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'any-docs'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Has notes"
                  value={hasNotes}
                  onChange={(event) =>
                    handleHasNotesChange(event.target.value as '' | 'true' | 'false')
                  }
                  fullWidth
                >
                  {TRISTATE_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'any-notes'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  size="small"
                  color="inherit"
                  onClick={handleClearAdvancedFilters}
                  disabled={!hasAdvancedFilters}
                  sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}
                >
                  Clear
                </Button>
              </Stack>
            </Collapse>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Submission list</Typography>
                {!submissionsQuery.isLoading && !submissionsQuery.isError && (
                  <Typography variant="body2" color="text.secondary">
                    {totalCount} submission{totalCount === 1 ? '' : 's'}
                  </Typography>
                )}
              </Box>

              <QueryFeedback
                isLoading={submissionsQuery.isLoading}
                isError={submissionsQuery.isError}
                errorMessage={
                  submissionsQuery.error instanceof Error
                    ? submissionsQuery.error.message
                    : undefined
                }
                isEmpty={results.length === 0}
                emptyMessage="No submissions match your filters."
                onRetry={() => submissionsQuery.refetch()}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell>Broker</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell align="center">Docs</TableCell>
                        <TableCell align="center">Notes</TableCell>
                        <TableCell>Latest note</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((submission) => (
                        <TableRow key={submission.id} hover>
                          <TableCell>
                            <MuiLink
                              component={Link}
                              href={`/submissions/${submission.id}`}
                              underline="hover"
                              fontWeight={500}
                            >
                              {submission.company.legalName}
                            </MuiLink>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {submission.company.industry} · {submission.company.headquartersCity}
                            </Typography>
                          </TableCell>
                          <TableCell>{submission.broker.name}</TableCell>
                          <TableCell>
                            <StatusChip status={submission.status} />
                          </TableCell>
                          <TableCell>
                            <PriorityChip priority={submission.priority} />
                          </TableCell>
                          <TableCell>{submission.owner.fullName}</TableCell>
                          <TableCell align="center">{submission.documentCount}</TableCell>
                          <TableCell align="center">{submission.noteCount}</TableCell>
                          <TableCell sx={{ maxWidth: 220 }}>
                            {submission.latestNote ? (
                              <>
                                <Typography variant="body2" noWrap>
                                  {submission.latestNote.bodyPreview}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {submission.latestNote.authorName} ·{' '}
                                  {formatRelativeDate(submission.latestNote.createdAt)}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(submission.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" pt={2}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </QueryFeedback>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
