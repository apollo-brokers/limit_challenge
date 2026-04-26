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
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { getStatusColor, getStatusLabel, getPriorityColor } from '@/lib/utils/submission-utils';
import { SubmissionDetailSkeleton } from '@/app/components/SubmissionDetailSkeleton';
import { ApiErrorState } from '@/app/components/ApiErrorState';

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
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            Submission Details
          </Typography>
          <Typography color="text.secondary">View and manage submission information</Typography>
        </Box>
        {!isLoading && !isError && data && (
          <Typography
            variant="body1"
            onClick={() => router.back()}
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
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
                {/* Status and Priority - Top Right */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  alignItems="flex-start"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={getStatusLabel(data.status)}
                      color={getStatusColor(data.status, theme.submissionColorMappings.status)}
                      size="medium"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={data.priority.toUpperCase()}
                      color={getPriorityColor(
                        data.priority,
                        theme.submissionColorMappings.priority,
                      )}
                      size="medium"
                    />
                  </Box>
                </Stack>

                {/* Company Info */}
                <Box>
                  <Typography variant="h3" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                    {data.company.legalName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {data.summary}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Key Info */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Key Information</Typography>
              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Typography>
                  <strong>Broker:</strong> {data.broker.name}{' '}
                  {data.broker.primaryContactEmail && `(${data.broker.primaryContactEmail})`}
                </Typography>
                <Typography>
                  <strong>Owner:</strong> {data.owner.fullName}{' '}
                  {data.owner.email && `(${data.owner.email})`}
                </Typography>
                <Typography>
                  <strong>Industry:</strong> {data.company.industry}
                </Typography>
                <Typography>
                  <strong>City:</strong> {data.company.headquartersCity}
                </Typography>
                <Typography>
                  <strong>Created:</strong> {new Date(data.createdAt).toLocaleDateString()}{' '}
                  {new Date(data.createdAt).toLocaleTimeString('en-US')}
                </Typography>
                <Typography>
                  <strong>Updated:</strong> {new Date(data.updatedAt).toLocaleDateString()}{' '}
                  {new Date(data.updatedAt).toLocaleTimeString('en-US')}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Contacts</Typography>
              <Divider sx={{ my: 2 }} />

              {data.contacts.length === 0 ? (
                <Typography color="text.secondary">No contacts available</Typography>
              ) : (
                <Stack spacing={2}>
                  {data.contacts.map((contact) => (
                    <Box key={contact.id}>
                      <Typography fontWeight={600}>{contact.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contact.role}
                      </Typography>
                      <Typography variant="body2">{contact.email}</Typography>
                      <Typography variant="body2">{contact.phone}</Typography>
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

              {data.documents.length === 0 ? (
                <Typography color="text.secondary">No documents available</Typography>
              ) : (
                <Stack spacing={1}>
                  {data.documents.map((doc) => (
                    <Box key={doc.id}>
                      <MuiLink href={doc.fileUrl} target="_blank">
                        {doc.title} ({doc.docType})
                      </MuiLink>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(doc.uploadedAt).toLocaleDateString()}{' '}
                        {new Date(doc.uploadedAt).toLocaleTimeString('en-US')}
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

              {data.notes.length === 0 ? (
                <Typography color="text.secondary">No notes available</Typography>
              ) : (
                <Stack spacing={2}>
                  {data.notes.map((note) => (
                    <Box key={note.id}>
                      <Typography fontWeight={600}>{note.authorName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(note.createdAt).toLocaleDateString()}{' '}
                        {new Date(note.createdAt).toLocaleTimeString('en-US')}
                      </Typography>
                      <Typography>{note.body}</Typography>
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
