'use client';

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  const detailQuery = useSubmissionDetail(submissionId);
  const submission = detailQuery.data;

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <div>
            <Typography variant="h4">Submission detail</Typography>
            <Typography color="text.secondary">
              Use this page to present the full submission payload along with contacts, documents,
              and notes.
            </Typography>
          </div>
          <MuiLink component={Link} href="/submissions" underline="none">
            Back to list
          </MuiLink>
        </Box>

        <Card variant="outlined">
          <CardContent>
            {detailQuery.isLoading && (
              <Stack spacing={1.5}>
                <Skeleton variant="text" height={36} />
                <Skeleton variant="rounded" height={80} />
                <Skeleton variant="rounded" height={80} />
              </Stack>
            )}

            {detailQuery.isError && (
              <Alert severity="error">Failed to load submission. {String(detailQuery.error)}</Alert>
            )}

            {!detailQuery.isLoading && !detailQuery.isError && !submission && (
              <Alert severity="info">No submission data returned.</Alert>
            )}

            {!detailQuery.isLoading && !detailQuery.isError && submission && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Typography>{submission.summary}</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip size="small" label={`Status: ${submission.status}`} />
                      <Chip size="small" label={`Priority: ${submission.priority}`} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Company: {submission.company.legalName} ({submission.company.industry}) | Broker:{' '}
                      {submission.broker.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Owner: {submission.owner.fullName} ({submission.owner.email})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created {formatDate(submission.createdAt)} | Updated {formatDate(submission.updatedAt)}
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Contacts ({submission.contacts.length})
                  </Typography>
                  {submission.contacts.length === 0 ? (
                    <Typography color="text.secondary">No contacts available.</Typography>
                  ) : (
                    <List dense disablePadding>
                      {submission.contacts.map((contact) => (
                        <ListItem key={contact.id} disableGutters>
                          <ListItemText
                            primary={`${contact.name} - ${contact.role}`}
                            secondary={`${contact.email} | ${contact.phone}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Documents ({submission.documents.length})
                  </Typography>
                  {submission.documents.length === 0 ? (
                    <Typography color="text.secondary">No documents uploaded.</Typography>
                  ) : (
                    <List dense disablePadding>
                      {submission.documents.map((document) => (
                        <ListItem key={document.id} disableGutters>
                          <ListItemText
                            primary={document.title}
                            secondary={`${document.docType} - ${formatDate(document.uploadedAt)}`}
                          />
                          <MuiLink href={document.fileUrl} target="_blank" rel="noreferrer">
                            Open
                          </MuiLink>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Notes ({submission.notes.length})
                  </Typography>
                  {submission.notes.length === 0 ? (
                    <Typography color="text.secondary">No notes yet.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {submission.notes.map((note) => (
                        <Card key={note.id} variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2">{note.authorName}</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {formatDate(note.createdAt)}
                            </Typography>
                            <Typography>{note.body}</Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
