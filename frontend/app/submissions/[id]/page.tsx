'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
  Chip,
  useTheme,
  Button,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { getStatusColor, getStatusLabel, getPriorityColor } from '@/lib/utils/submission-utils';
import { formatDateTime } from '@/lib/utils/date-utils';
import { ApiErrorState, SubmissionDetailSkeleton } from '@/app/components';

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading, isError } = useSubmissionDetail(submissionId);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
            Submission Details
          </Typography>
          <Typography color="text.secondary">View and manage submission information</Typography>
        </Box>
        {!isLoading && !isError && data && (
          <Typography
            variant="body1"
            onClick={() => router.back()}
            sx={{
              color: theme.palette.primary.main,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            ← Back to list
          </Typography>
        )}
      </Stack>

      {/* Loading State */}
      {isLoading && <SubmissionDetailSkeleton />}

      {/* Error State */}
      {isError && !isLoading && (
        <>
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6">Unable to load submission details</Typography>
            <Link href="/submissions">
              <Button variant="contained">Back to Submissions</Button>
            </Link>
          </Stack>
          <ApiErrorState entityName="submission" />
        </>
      )}

      {/* Success State */}
      {!isLoading && !isError && data && (
        <Stack spacing={4}>
          {/* Hero Header Section */}
          <Card
            variant="outlined"
            sx={{
              background: theme.heroGradient,
              borderRadius: 2,
              borderColor: 'primary.light',
            }}
          >
            <CardContent sx={{ pb: 3 }}>
              <Stack spacing={3}>
                <Grid container spacing={3} alignItems="flex-start">
                  {/* Company Info */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                        {data.company.legalName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.summary}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Status + Priority */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Status:
                        </Typography>
                        <Chip
                          label={getStatusLabel(data.status)}
                          color={getStatusColor(data.status, theme.submissionColorMappings.status)}
                          size="medium"
                        />
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Priority:
                        </Typography>
                        <Chip
                          label={data.priority.toUpperCase()}
                          color={getPriorityColor(
                            data.priority,
                            theme.submissionColorMappings.priority,
                          )}
                          size="medium"
                        />
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Key Info */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Key Information</Typography>
              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Broker:</strong> {data.broker?.name || 'N/A'}{' '}
                  {data.broker?.primaryContactEmail && `(${data.broker.primaryContactEmail})`}
                </Typography>
                <Typography variant="body2">
                  <strong>Owner:</strong> {data.owner?.fullName || 'N/A'}{' '}
                  {data.owner?.email && `(${data.owner.email})`}
                </Typography>
                <Typography variant="body2">
                  <strong>Industry:</strong> {data.company?.industry || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>City:</strong> {data.company?.headquartersCity || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {formatDateTime(data.createdAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Updated:</strong> {formatDateTime(data.updatedAt)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Contacts</Typography>
              <Divider sx={{ my: 2 }} />

              {(data.contacts?.length ?? 0) === 0 ? (
                <Typography color="text.secondary">No contacts available</Typography>
              ) : (
                <Stack spacing={2}>
                  {data.contacts?.map((contact) => (
                    <Box key={contact.id}>
                      <Typography variant="body2" fontWeight={600}>
                        {contact.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contact.role}
                      </Typography>
                      <Typography variant="body2">{contact.email || 'N/A'}</Typography>
                      <Typography variant="body2">{contact.phone || 'N/A'}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Documents</Typography>
              <Divider sx={{ my: 2 }} />

              {(data.documents?.length ?? 0) === 0 ? (
                <Typography color="text.secondary">No documents available</Typography>
              ) : (
                <Stack spacing={1}>
                  {data.documents?.map((doc) => (
                    <Box key={doc.id}>
                      <MuiLink href={doc.fileUrl} target="_blank">
                        <Typography variant="body2">
                          {doc.title} ({doc.docType})
                        </Typography>
                      </MuiLink>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(doc.uploadedAt)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Notes</Typography>
              <Divider sx={{ my: 2 }} />

              {(data.notes?.length ?? 0) === 0 ? (
                <Typography color="text.secondary">No notes available</Typography>
              ) : (
                <Stack spacing={2}>
                  {data.notes?.map((note) => (
                    <Box key={note.id}>
                      <Typography variant="body2" fontWeight={600}>
                        {note.authorName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(note.createdAt)}
                      </Typography>
                      <Typography variant="body2">{note.body}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </Container>
  );
}
