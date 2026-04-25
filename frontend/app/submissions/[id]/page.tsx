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
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  const { data, isLoading, isError } = useSubmissionDetail(submissionId);

  if (isLoading) {
    return <Container sx={{ py: 6 }}>Loading...</Container>;
  }

  if (isError || !data) {
    return <Container sx={{ py: 6 }}>Failed to load submission</Container>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h4">{data.company.legalName}</Typography>
            <Typography color="text.secondary">{data.summary}</Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Chip label={data.status.toUpperCase()} color="primary" />
            <Chip label={data.priority.toUpperCase()} variant="outlined" />
          </Stack>
        </Box>

        <MuiLink component={Link} href="/submissions" underline="none">
          ← Back to list
        </MuiLink>

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
                <strong>Owner:</strong> {data.owner.fullName}
                {data.owner.email && `(${data.owner.email})`}
              </Typography>
              <Typography>
                <strong>Industry:</strong> {data.company.industry}
              </Typography>
              <Typography>
                <strong>City:</strong> {data.company.headquartersCity}
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
                      {new Date(doc.uploadedAt).toLocaleDateString()}
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
                      {new Date(note.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography>{note.body}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
