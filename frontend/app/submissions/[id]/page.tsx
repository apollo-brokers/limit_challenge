'use client';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import {
  formatDate,
  formatDateTime,
  priorityPresentation,
  statusPresentation,
} from '@/lib/submission-presentation';

function DetailLoadingState() {
  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width="30%" height={32} />
            <Skeleton variant="text" width="60%" height={48} />
            <Skeleton variant="rounded" height={84} />
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="rounded" height={180} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function EmptySection({ title, description }: { title: string; description: string }) {
  return (
    <Card variant="outlined" sx={{ backgroundColor: 'background.default' }}>
      <CardContent>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  const detailQuery = useSubmissionDetail(submissionId);
  const submission = detailQuery.data;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" component="h1">
              Submission
            </Typography>
          </Box>
          <Button component={Link} href="/submissions">
            Back to list
          </Button>
        </Stack>

        {detailQuery.isLoading ? <DetailLoadingState /> : null}

        {detailQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => detailQuery.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load this submission. Make sure the backend server is running and try again.
          </Alert>
        ) : null}

        {submission ? (
          <>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h3">{submission.company.legalName}</Typography>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        {submission.company.industry || 'Industry not provided'} in{' '}
                        {submission.company.headquartersCity || 'Unknown city'}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-start">
                      <Chip
                        label={statusPresentation[submission.status].label}
                        color={statusPresentation[submission.status].color}
                      />
                      <Chip
                        label={priorityPresentation[submission.priority].label}
                        color={priorityPresentation[submission.priority].color}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  <Typography sx={{ maxWidth: 820 }}>
                    {submission.summary || 'No summary provided.'}
                  </Typography>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Broker
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {submission.broker.name.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>{submission.broker.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {submission.broker.primaryContactEmail || 'No broker email on file'}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Internal owner
                        </Typography>
                        <Typography fontWeight={600} sx={{ mt: 1 }}>
                          {submission.owner.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {submission.owner.email}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Activity
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Created {formatDateTime(submission.createdAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Updated {formatDateTime(submission.updatedAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h5">Contacts</Typography>
                  {submission.contacts.length ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'repeat(2, minmax(0, 1fr))',
                        },
                      }}
                    >
                      {submission.contacts.map((contact) => (
                        <Card key={contact.id} variant="outlined">
                          <CardContent>
                            <Stack spacing={1}>
                              <Typography variant="h6">{contact.name}</Typography>
                              <Typography color="text.secondary">
                                {contact.role || 'Role not provided'}
                              </Typography>
                              <Divider />
                              <Typography variant="body2">
                                {contact.email || 'No email on file'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {contact.phone || 'No phone on file'}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <EmptySection
                      title="No contacts"
                      description="No contacts are attached to this submission."
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Typography variant="h5">Documents</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {submission.documents.length} supporting file
                      {submission.documents.length === 1 ? '' : 's'}
                    </Typography>
                  </Stack>

                  {submission.documents.length ? (
                    <Stack spacing={2}>
                      {submission.documents.map((document) => (
                        <Card key={document.id} variant="outlined">
                          <CardContent>
                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              justifyContent="space-between"
                              spacing={2}
                            >
                              <Box>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  flexWrap="wrap"
                                >
                                  <Typography variant="h6">{document.title}</Typography>
                                  <Chip label={document.docType} size="small" variant="outlined" />
                                </Stack>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                  Uploaded {formatDate(document.uploadedAt)}
                                </Typography>
                              </Box>
                              <Box>
                                {document.fileUrl ? (
                                  <MuiLink
                                    href={document.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    underline="hover"
                                  >
                                    Open document
                                  </MuiLink>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No file link available
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <EmptySection
                      title="No documents"
                      description="No documents are attached to this submission."
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Typography variant="h5">Collaboration notes</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {submission.notes.length} note{submission.notes.length === 1 ? '' : 's'}
                    </Typography>
                  </Stack>

                  {submission.notes.length ? (
                    <Stack spacing={2}>
                      {submission.notes.map((note) => (
                        <Box
                          key={note.id}
                          sx={{
                            borderLeft: '3px solid',
                            borderColor: 'primary.main',
                            pl: 2,
                            py: 0.5,
                          }}
                        >
                          <Stack spacing={0.75}>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              spacing={1}
                            >
                              <Typography fontWeight={600}>{note.authorName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDateTime(note.createdAt)}
                              </Typography>
                            </Stack>
                            <Typography color="text.secondary">{note.body}</Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <EmptySection
                      title="No notes yet"
                      description="There is no collaboration history attached to this submission."
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </>
        ) : null}
      </Stack>
    </Container>
  );
}
