'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Link as MuiLink,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';

import { AppShell } from '@/components/layout/AppShell';
import { PriorityChip, StatusChip, formatDate, formatDateTime } from '@/components/submissions/status';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';

function DetailSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="text" width={280} height={48} />
      <Skeleton variant="rounded" height={140} />
      <Skeleton variant="rounded" height={180} />
      <Skeleton variant="rounded" height={180} />
    </Stack>
  );
}

export function SubmissionDetailView() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const submissionId = params?.id ?? '';
  const fromQuery = searchParams.get('from');
  const backHref = fromQuery ? `/submissions?${fromQuery}` : '/submissions';

  const detailQuery = useSubmissionDetail(submissionId);
  const submission = detailQuery.data;
  const isNotFound =
    axios.isAxiosError(detailQuery.error) && detailQuery.error.response?.status === 404;

  return (
    <AppShell maxWidth="md">
      <Stack spacing={3}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
          <Box>
            <Typography variant="h4" component="h1">
              {submission?.company.legalName || 'Submission detail'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Full submission context for review — contacts, documents, and notes.
            </Typography>
          </Box>
          <Button component={Link} href={backHref} variant="outlined" size="small">
            ← Back to list
          </Button>
        </Box>

        {detailQuery.isLoading ? <DetailSkeleton /> : null}

        {detailQuery.isError ? (
          <Alert
            severity={isNotFound ? 'warning' : 'error'}
            action={
              isNotFound ? undefined : (
                <Button color="inherit" size="small" onClick={() => detailQuery.refetch()}>
                  Retry
                </Button>
              )
            }
          >
            {isNotFound
              ? 'This submission was not found. It may have been removed.'
              : 'Could not load this submission. Check that the API is running and try again.'}
          </Alert>
        ) : null}

        {submission ? (
          <>
            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <StatusChip status={submission.status} />
                    <PriorityChip priority={submission.priority} />
                    <Chip size="small" label={`#${submission.id}`} variant="outlined" />
                  </Stack>

                  <Typography variant="body1">{submission.summary || 'No summary provided.'}</Typography>

                  <Divider />

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Broker
                      </Typography>
                      <Typography>{submission.broker.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {submission.broker.primaryContactEmail || 'No email on file'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Owner
                      </Typography>
                      <Typography>{submission.owner.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {submission.owner.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Company
                      </Typography>
                      <Typography>{submission.company.legalName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[submission.company.industry, submission.company.headquartersCity]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Dates
                      </Typography>
                      <Typography variant="body2">
                        Created {formatDate(submission.createdAt)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Updated {formatDate(submission.updatedAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                  Contacts ({submission.contacts.length})
                </Typography>
                {submission.contacts.length === 0 ? (
                  <Typography color="text.secondary">No contacts on this submission.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submission.contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>{contact.name}</TableCell>
                          <TableCell>{contact.role || '—'}</TableCell>
                          <TableCell>{contact.email || '—'}</TableCell>
                          <TableCell>{contact.phone || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                  Documents ({submission.documents.length})
                </Typography>
                {submission.documents.length === 0 ? (
                  <Typography color="text.secondary">No documents attached.</Typography>
                ) : (
                  <Stack spacing={1.5} divider={<Divider flexItem />}>
                    {submission.documents.map((document) => (
                      <Box
                        key={document.id}
                        display="flex"
                        justifyContent="space-between"
                        gap={2}
                        flexWrap="wrap"
                      >
                        <Box>
                          <Typography fontWeight={600}>{document.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {document.docType} · uploaded {formatDate(document.uploadedAt)}
                          </Typography>
                        </Box>
                        {document.fileUrl ? (
                          <MuiLink href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                            Open file
                          </MuiLink>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No file URL
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                  Notes ({submission.notes.length})
                </Typography>
                {submission.notes.length === 0 ? (
                  <Typography color="text.secondary">No notes yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {submission.notes.map((note) => (
                      <Box
                        key={note.id}
                        sx={{
                          borderLeft: '3px solid',
                          borderColor: 'primary.main',
                          pl: 2,
                          py: 1,
                          borderRadius: 1,
                          bgcolor: 'grey.50',
                        }}
                      >
                        <Typography variant="subtitle2">{note.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                          {formatDateTime(note.createdAt)}
                        </Typography>
                        <Typography variant="body2">{note.body}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </Stack>
    </AppShell>
  );
}
