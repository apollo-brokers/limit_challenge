'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Link as MuiLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { QueryFeedback } from '@/components/QueryFeedback';
import { PriorityChip, StatusChip } from '@/components/StatusChip';
import { formatDate } from '@/lib/format';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  const detailQuery = useSubmissionDetail(submissionId);
  const submission = detailQuery.data;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
          <div>
            <Typography variant="h4" component="h1">
              {submission ? submission.company.legalName : 'Submission detail'}
            </Typography>
            <Typography color="text.secondary">
              Full submission record with contacts, documents, and notes.
            </Typography>
          </div>
          <MuiLink component={Link} href="/submissions" underline="hover">
            ← Back to list
          </MuiLink>
        </Box>

        <QueryFeedback
          isLoading={detailQuery.isLoading}
          isError={detailQuery.isError}
          errorMessage={detailQuery.error instanceof Error ? detailQuery.error.message : undefined}
          isEmpty={!submission && !detailQuery.isLoading && !detailQuery.isError}
          emptyMessage="Submission not found."
          onRetry={() => detailQuery.refetch()}
        >
          {submission && (
            <Stack spacing={3}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={3}>
                    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                      <StatusChip status={submission.status} />
                      <PriorityChip priority={submission.priority} />
                    </Box>

                    <Typography variant="body1">{submission.summary}</Typography>

                    <Divider />

                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                      <DetailField label="Company" value={submission.company.legalName} />
                      <DetailField
                        label="Industry"
                        value={`${submission.company.industry} · ${submission.company.headquartersCity}`}
                      />
                      <DetailField label="Broker" value={submission.broker.name} />
                      <DetailField
                        label="Broker contact"
                        value={submission.broker.primaryContactEmail ?? '—'}
                      />
                      <DetailField label="Owner" value={submission.owner.fullName} />
                      <DetailField label="Owner email" value={submission.owner.email} />
                      <DetailField label="Created" value={formatDate(submission.createdAt)} />
                      <DetailField label="Updated" value={formatDate(submission.updatedAt)} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contacts ({submission.contacts.length})
                  </Typography>
                  {submission.contacts.length === 0 ? (
                    <Typography color="text.secondary">No contacts on file.</Typography>
                  ) : (
                    <TableContainer>
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
                              <TableCell>{contact.role}</TableCell>
                              <TableCell>{contact.email}</TableCell>
                              <TableCell>{contact.phone || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documents ({submission.documents.length})
                  </Typography>
                  {submission.documents.length === 0 ? (
                    <Typography color="text.secondary">No documents attached.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {submission.documents.map((doc) => (
                        <Box
                          key={doc.id}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          gap={2}
                        >
                          <Box>
                            <MuiLink
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              {doc.title}
                            </MuiLink>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {doc.docType} · uploaded {formatDate(doc.uploadedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes ({submission.notes.length})
                  </Typography>
                  {submission.notes.length === 0 ? (
                    <Typography color="text.secondary">No notes yet.</Typography>
                  ) : (
                    <Stack spacing={2} divider={<Divider flexItem />}>
                      {submission.notes.map((note) => (
                        <Box key={note.id}>
                          <Typography variant="subtitle2">{note.authorName}</Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={0.5}
                          >
                            {formatDate(note.createdAt)}
                          </Typography>
                          <Typography variant="body2" whiteSpace="pre-wrap">
                            {note.body}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Stack>
          )}
        </QueryFeedback>
      </Stack>
    </Container>
  );
}
