'use client';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Skeleton,
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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import {
  formatDate,
  formatDateTime,
  priorityPresentation,
  statusPresentation,
} from '@/lib/submission-presentation';
import { SubmissionListItem, SubmissionPriority, SubmissionStatus } from '@/lib/types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const PRIORITY_OPTIONS: { label: string; value: SubmissionPriority | '' }[] = [
  { label: 'All priorities', value: '' },
  { label: 'High priority', value: 'high' },
  { label: 'Medium priority', value: 'medium' },
  { label: 'Low priority', value: 'low' },
];

function isStatus(value: string | null): value is SubmissionStatus {
  return value === 'new' || value === 'in_review' || value === 'closed' || value === 'lost';
}

function isPriority(value: string | null): value is SubmissionPriority {
  return value === 'high' || value === 'medium' || value === 'low';
}

function LoadingState() {
  return (
    <Stack spacing={2}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <Skeleton variant="text" width="35%" height={36} />
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="rounded" height={72} />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

function SubmissionCard({ submission }: { submission: SubmissionListItem }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="h6">{submission.company.legalName}</Typography>
              <Typography color="text.secondary">
                {submission.company.industry || 'Industry not provided'} in{' '}
                {submission.company.headquartersCity || 'Unknown city'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
              <Chip
                label={statusPresentation[submission.status].label}
                color={statusPresentation[submission.status].color}
                size="small"
              />
              <Chip
                label={priorityPresentation[submission.priority].label}
                color={priorityPresentation[submission.priority].color}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
            }}
          >
            {submission.summary || 'No summary provided.'}
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 12 }}>
                {submission.broker.name.slice(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2">{submission.broker.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Broker
                </Typography>
              </Box>
            </Stack>
            <Box>
              <Typography variant="body2">{submission.owner.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">
                Owner
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            <Typography variant="body2" color="text.secondary">
              {submission.documentCount} documents, {submission.noteCount} notes, created{' '}
              {formatDate(submission.createdAt)}
            </Typography>
            {submission.latestNote ? (
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Latest note by {submission.latestNote.authorName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(submission.latestNote.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  {submission.latestNote.bodyPreview}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No notes yet.
              </Typography>
            )}
          </Stack>

          <Box>
            <Button component={Link} href={`/submissions/${submission.id}`} variant="contained">
              Open details
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SubmissionTableView({ submissions }: { submissions: SubmissionListItem[] }) {
  return (
    <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>Broker</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Activity</TableCell>
            <TableCell>Latest note</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id} hover>
              <TableCell sx={{ minWidth: 240 }}>
                <Typography fontWeight={600}>{submission.company.legalName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {submission.company.industry || 'Industry not provided'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {submission.company.headquartersCity || 'Unknown city'}
                </Typography>
              </TableCell>
              <TableCell>{submission.broker.name}</TableCell>
              <TableCell>
                <Typography variant="body2">{submission.owner.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {submission.owner.email}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={statusPresentation[submission.status].label}
                  color={statusPresentation[submission.status].color}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={priorityPresentation[submission.priority].label}
                  color={priorityPresentation[submission.priority].color}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{submission.documentCount} docs</Typography>
                <Typography variant="body2" color="text.secondary">
                  {submission.noteCount} notes
                </Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 280 }}>
                {submission.latestNote ? (
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                      {submission.latestNote.authorName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                      }}
                    >
                      {submission.latestNote.bodyPreview}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No notes yet
                  </Typography>
                )}
              </TableCell>
              <TableCell>{formatDate(submission.createdAt)}</TableCell>
              <TableCell align="right">
                <Button component={Link} href={`/submissions/${submission.id}`} size="small">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
          <LoadingState />
        </Container>
      }
    >
      <SubmissionsPageContent />
    </Suspense>
  );
}

function SubmissionsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const statusParam = searchParams.get('status');
  const priorityParam = searchParams.get('priority');
  const brokerId = searchParams.get('brokerId') ?? '';
  const companySearch = searchParams.get('companySearch') ?? '';
  const hasDocuments = searchParams.get('hasDocuments') === 'true';
  const hasNotes = searchParams.get('hasNotes') === 'true';
  const pageParam = Number(searchParams.get('page') ?? '1');
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const status = isStatus(statusParam) ? statusParam : undefined;
  const priority = isPriority(priorityParam) ? priorityParam : undefined;

  const [companyInput, setCompanyInput] = useState(companySearch);
  const deferredCompanyInput = useDeferredValue(companyInput);

  useEffect(() => {
    setCompanyInput(companySearch);
  }, [companySearch]);

  const filters = useMemo(
    () => ({
      status,
      priority,
      brokerId: brokerId || undefined,
      companySearch: companySearch || undefined,
      hasDocuments: hasDocuments || undefined,
      hasNotes: hasNotes || undefined,
      page: currentPage,
    }),
    [brokerId, companySearch, currentPage, hasDocuments, hasNotes, priority, status],
  );

  useEffect(() => {
    if (deferredCompanyInput === companySearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (deferredCompanyInput.trim()) {
        params.set('companySearch', deferredCompanyInput.trim());
      } else {
        params.delete('companySearch');
      }
      params.delete('page');

      const nextQuery = params.toString();
      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [companySearch, deferredCompanyInput, pathname, router, searchParams, startTransition]);

  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();

  const submissions = submissionsQuery.data?.results ?? [];
  const totalCount = submissionsQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const activeFilterCount = [
    status,
    priority,
    brokerId,
    companySearch,
    hasDocuments ? 'hasDocuments' : '',
    hasNotes ? 'hasNotes' : '',
  ].filter(Boolean).length;

  const updateSearchParams = (updates: Record<string, string | undefined>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (resetPage) {
      params.delete('page');
    }

    const nextQuery = params.toString();
    startTransition(() => {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    });
  };

  const clearFilters = () => {
    setCompanyInput('');
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Card
          sx={{
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h3" component="h1" sx={{ mt: 0.5 }}>
                  Submission Tracker
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 760, mt: 1.5 }}>
                  Review incoming submissions, filter the queue, and open each record for more
                  detail.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Card variant="outlined" sx={{ minWidth: 180, flex: 1 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Total submissions
                    </Typography>
                    <Typography variant="h4">{totalCount}</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 180, flex: 1 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Active filters
                    </Typography>
                    <Typography variant="h4">{activeFilterCount}</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 180, flex: 1 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Current page
                    </Typography>
                    <Typography variant="h4">
                      {currentPage}
                      <Typography component="span" variant="body1" color="text.secondary">
                        {' '}
                        / {totalPages}
                      </Typography>
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
              >
                <Box>
                  <Typography variant="h6">Filter the queue</Typography>
                  <Typography color="text.secondary">
                    Filters are stored in the URL so the current view is easy to share or revisit.
                  </Typography>
                </Box>
                <Button onClick={clearFilters} disabled={!activeFilterCount}>
                  Clear filters
                </Button>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Status"
                  value={status ?? ''}
                  onChange={(event) =>
                    updateSearchParams({ status: event.target.value || undefined })
                  }
                  fullWidth
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.label} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Priority"
                  value={priority ?? ''}
                  onChange={(event) =>
                    updateSearchParams({ priority: event.target.value || undefined })
                  }
                  fullWidth
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <MenuItem key={option.label} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Broker"
                  value={brokerId}
                  onChange={(event) =>
                    updateSearchParams({ brokerId: event.target.value || undefined })
                  }
                  fullWidth
                  disabled={brokerQuery.isLoading}
                  helperText={
                    brokerQuery.isError
                      ? 'Broker options could not be loaded.'
                      : 'Filter by broker'
                  }
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
                  value={companyInput}
                  onChange={(event) => setCompanyInput(event.target.value)}
                  fullWidth
                  helperText="Matches company name, industry, or city"
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasDocuments}
                      onChange={(event) =>
                        updateSearchParams({
                          hasDocuments: event.target.checked ? 'true' : undefined,
                        })
                      }
                    />
                  }
                  label="Only submissions with documents"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasNotes}
                      onChange={(event) =>
                        updateSearchParams({
                          hasNotes: event.target.checked ? 'true' : undefined,
                        })
                      }
                    />
                  }
                  label="Only submissions with notes"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          {(submissionsQuery.isFetching || isPending) && <LinearProgress />}
          <CardContent>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
              >
                <Box>
                  <Typography variant="h6">Incoming submissions</Typography>
                  <Typography color="text.secondary">
                    Showing {submissions.length} on this page out of {totalCount} results.
                  </Typography>
                </Box>
                {submissionsQuery.isFetching && !submissionsQuery.isLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Updating...
                  </Typography>
                ) : null}
              </Stack>

              {submissionsQuery.isLoading ? <LoadingState /> : null}

              {submissionsQuery.isError ? (
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={() => submissionsQuery.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Could not load submissions. Make sure the backend server is running and try again.
                </Alert>
              ) : null}

              {!submissionsQuery.isLoading &&
              !submissionsQuery.isError &&
              submissions.length === 0 ? (
                <Card variant="outlined" sx={{ backgroundColor: 'background.default' }}>
                  <CardContent>
                    <Stack spacing={1.5} alignItems="flex-start">
                      <Typography variant="h6">No submissions found</Typography>
                      <Typography color="text.secondary">
                        Try changing the filters or clearing them.
                      </Typography>
                      <Button onClick={clearFilters} variant="contained">
                        Reset filters
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {!submissionsQuery.isLoading &&
              !submissionsQuery.isError &&
              submissions.length > 0 ? (
                <>
                  <SubmissionTableView submissions={submissions} />
                  <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
                    {submissions.map((submission) => (
                      <SubmissionCard key={submission.id} submission={submission} />
                    ))}
                  </Stack>
                  <Divider />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Page {currentPage} of {totalPages}
                    </Typography>
                    <Pagination
                      page={currentPage}
                      count={totalPages}
                      color="primary"
                      onChange={(_, page) => updateSearchParams({ page: String(page) }, false)}
                    />
                  </Stack>
                </>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
