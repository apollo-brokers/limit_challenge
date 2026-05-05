'use client';

import {
  Alert,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Link as MuiLink,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionListItem, SubmissionStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

export default function SubmissionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get('status') as SubmissionStatus | null) ?? '';
  const brokerId = searchParams.get('brokerId') ?? '';
  const companyQuery = searchParams.get('companySearch') ?? '';
  const createdFrom = searchParams.get('createdFrom') ?? '';
  const createdTo = searchParams.get('createdTo') ?? '';
  const hasDocuments = searchParams.get('hasDocuments') ?? '';
  const hasNotes = searchParams.get('hasNotes') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
        return;
      }
      params.set(key, value);
    });

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  const filters = useMemo(
    () => ({
      status: status || undefined,
      brokerId: brokerId || undefined,
      companySearch: companyQuery || undefined,
      page,
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      hasDocuments: hasDocuments === '' ? undefined : hasDocuments === 'true',
      hasNotes: hasNotes === '' ? undefined : hasNotes === 'true',
    }),
    [status, brokerId, companyQuery, page, createdFrom, createdTo, hasDocuments, hasNotes],
  );

  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();
  const submissions = submissionsQuery.data?.results ?? [];
  const pageSize = submissions.length || 1;
  const totalPages = Math.max(1, Math.ceil((submissionsQuery.data?.count ?? 0) / pageSize));

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  }

  function statusLabel(value: SubmissionStatus) {
    if (value === 'in_review') return 'In review';
    return value[0].toUpperCase() + value.slice(1);
  }

  function statusColor(value: SubmissionStatus): 'default' | 'warning' | 'success' | 'error' | 'info' {
    if (value === 'new') return 'info';
    if (value === 'in_review') return 'warning';
    if (value === 'closed') return 'success';
    return 'error';
  }

  function renderSubmissionCard(item: SubmissionListItem) {
    return (
      <Card key={item.id} variant="outlined">
        <CardContent>
          <Stack spacing={1.5}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{item.company.legalName}</Typography>
              <Chip label={statusLabel(item.status)} color={statusColor(item.status)} size="small" />
            </Box>
            <Typography color="text.secondary">{item.summary}</Typography>
            <Typography variant="body2">Broker: {item.broker.name}</Typography>
            <Typography variant="body2">Owner: {item.owner.fullName}</Typography>
            <Typography variant="body2">
              Documents: {item.documentCount} | Notes: {item.noteCount}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Updated {formatDate(item.updatedAt)}
              </Typography>
              <MuiLink component={Link} href={`/submissions/${item.id}`}>
                View detail
              </MuiLink>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1">
            Submissions
          </Typography>
          <Typography color="text.secondary">
            Filters update the query parameters and drive backend filtering. Hook these inputs to
            your API calls when you implement the actual data fetching.
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
                  updateParams({
                    status: event.target.value || undefined,
                    page: '1',
                  })
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
                onChange={(event) =>
                  updateParams({
                    brokerId: event.target.value || undefined,
                    page: '1',
                  })
                }
                fullWidth
                helperText="Loaded from /brokers/"
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
                onChange={(event) =>
                  updateParams({
                    companySearch: event.target.value || undefined,
                    page: '1',
                  })
                }
                fullWidth
                helperText="Sent as ?companySearch=..."
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <TextField
                type="date"
                label="Created from"
                value={createdFrom}
                onChange={(event) =>
                  updateParams({
                    createdFrom: event.target.value || undefined,
                    page: '1',
                  })
                }
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                type="date"
                label="Created to"
                value={createdTo}
                onChange={(event) =>
                  updateParams({
                    createdTo: event.target.value || undefined,
                    page: '1',
                  })
                }
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                select
                label="Has documents"
                value={hasDocuments}
                onChange={(event) =>
                  updateParams({
                    hasDocuments: event.target.value || undefined,
                    page: '1',
                  })
                }
                fullWidth
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
              <TextField
                select
                label="Has notes"
                value={hasNotes}
                onChange={(event) =>
                  updateParams({
                    hasNotes: event.target.value || undefined,
                    page: '1',
                  })
                }
                fullWidth
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Stack>
            <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="text"
                onClick={() => router.replace(pathname)}
                disabled={searchParams.toString().length === 0}
              >
                Clear filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Submission list ({submissionsQuery.data?.count ?? 0})</Typography>
              <Divider />

              {submissionsQuery.isLoading && (
                <Stack spacing={1.5}>
                  <Skeleton variant="rounded" height={52} />
                  <Skeleton variant="rounded" height={52} />
                  <Skeleton variant="rounded" height={52} />
                </Stack>
              )}

              {submissionsQuery.isError && (
                <Alert severity="error">
                  Failed to load submissions. {String(submissionsQuery.error)}
                </Alert>
              )}

              {!submissionsQuery.isLoading && !submissionsQuery.isError && submissions.length === 0 && (
                <Alert severity="info">No submissions match these filters.</Alert>
              )}

              {!submissionsQuery.isLoading && !submissionsQuery.isError && submissions.length > 0 && (
                <>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Company</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Broker</TableCell>
                          <TableCell>Owner</TableCell>
                          <TableCell align="right">Documents</TableCell>
                          <TableCell align="right">Notes</TableCell>
                          <TableCell>Updated</TableCell>
                          <TableCell align="right">Detail</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {submissions.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{item.company.legalName}</TableCell>
                            <TableCell>
                              <Chip
                                label={statusLabel(item.status)}
                                color={statusColor(item.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{item.broker.name}</TableCell>
                            <TableCell>{item.owner.fullName}</TableCell>
                            <TableCell align="right">{item.documentCount}</TableCell>
                            <TableCell align="right">{item.noteCount}</TableCell>
                            <TableCell>{formatDate(item.updatedAt)}</TableCell>
                            <TableCell align="right">
                              <MuiLink component={Link} href={`/submissions/${item.id}`}>
                                Open
                              </MuiLink>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                  <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
                    {submissions.map((item) => renderSubmissionCard(item))}
                  </Stack>
                </>
              )}

              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Page {page} of {totalPages}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    disabled={page <= 1 || submissionsQuery.isLoading}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={page >= totalPages || submissionsQuery.isLoading}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
