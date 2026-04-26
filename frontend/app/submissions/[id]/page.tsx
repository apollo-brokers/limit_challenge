'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
  Chip,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { SubmissionStatus, SubmissionPriority } from '@/lib/types';

const statusColor = (status: SubmissionStatus | undefined) => {
  switch (status) {
    case 'new': return 'info';
    case 'in_review': return 'warning';
    case 'closed': return 'success';
    case 'lost': return 'error';
    default: return 'default';
  }
};

const priorityColor = (priority: SubmissionPriority | undefined) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  const { data: submission, isLoading, isError } = useSubmissionDetail(submissionId);

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography color="error">Failed to load submission details.</Typography>
        <MuiLink component={Link} href="/submissions" underline="hover">
          Return to list
        </MuiLink>
      </Container>
    );
  }

  if (isLoading || !submission) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <Skeleton variant="rounded" height={60} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}><Skeleton variant="rounded" height={300} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><Skeleton variant="rounded" height={300} /></Grid>
          </Grid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        {/* Header / Hero Section */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <MuiLink component={Link} href="/submissions" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <ArrowBackIcon fontSize="small" /> Back
          </MuiLink>
          <Box display="flex" gap={2}>
            <Typography variant="body2" color="text.secondary">
              ID: #{submission.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Updated: {new Date(submission.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Card variant="outlined" sx={{ borderRadius: 2, borderTop: 4, borderColor: submission.status === 'closed' ? 'success.main' : 'primary.main' }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {submission.company.legalName}
                </Typography>
                <Stack direction="row" spacing={1} mb={2}>
                  <Chip label={submission.status.replace('_', ' ').toUpperCase()} size="small" color={statusColor(submission.status)} />
                  <Chip label={submission.priority.toUpperCase()} size="small" variant="outlined" color={priorityColor(submission.priority)} />
                </Stack>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {submission.summary || 'No summary available.'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Key Stakeholders
                  </Typography>
                  <Stack spacing={1.5} mt={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        <strong>Owner:</strong> {submission.owner.fullName}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BusinessIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        <strong>Broker:</strong> {submission.broker.name}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarTodayIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        <strong>Created:</strong> {new Date(submission.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Detailed Panels Grid */}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              {/* Notes Activity Feed */}
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={2}>Activity & Notes</Typography>
                {submission.notes.length === 0 ? (
                  <Typography color="text.secondary">No notes recorded yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {submission.notes.map((note) => (
                      <Paper key={note.id} variant="outlined" sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="subtitle2" fontWeight="bold">{note.authorName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(note.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {note.body}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={4}>
              {/* Contacts */}
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={2}>Contacts</Typography>
                <Card variant="outlined">
                  <List disablePadding>
                    {submission.contacts.length === 0 ? (
                      <ListItem><ListItemText secondary="No contacts included." /></ListItem>
                    ) : (
                      submission.contacts.map((contact, index) => (
                        <div key={contact.id}>
                          <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight="bold">{contact.name}</Typography>
                            <Typography variant="caption" color="text.secondary" gutterBottom>{contact.role}</Typography>
                            {contact.email && (
                              <Box 
                                display="flex" alignItems="center" gap={0.5} mt={0.5} 
                                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                onClick={() => navigator.clipboard.writeText(contact.email)}
                                title="Click to copy"
                              >
                                <EmailIcon fontSize="inherit" color="inherit" />
                                <Typography variant="caption" color="inherit">{contact.email}</Typography>
                              </Box>
                            )}
                            {contact.phone && (
                              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                <PhoneIcon fontSize="inherit" color="action" />
                                <Typography variant="caption">{contact.phone}</Typography>
                              </Box>
                            )}
                          </ListItem>
                          {index < submission.contacts.length - 1 && <Divider component="li" />}
                        </div>
                      ))
                    )}
                  </List>
                </Card>
              </Box>

              {/* Documents */}
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={2}>Documents</Typography>
                <Card variant="outlined">
                  <List disablePadding>
                    {submission.documents.length === 0 ? (
                      <ListItem><ListItemText secondary="No documents uploaded." /></ListItem>
                    ) : (
                      submission.documents.map((doc, index) => (
                        <div key={doc.id}>
                          <ListItem>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <DescriptionIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={<MuiLink href={doc.fileUrl || '#'} target="_blank" underline="hover">{doc.title}</MuiLink>}
                              secondary={doc.docType} 
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                          {index < submission.documents.length - 1 && <Divider component="li" />}
                        </div>
                      ))
                    )}
                  </List>
                </Card>
              </Box>
            </Stack>
          </Grid>
        </Grid>
        
      </Stack>
    </Container>
  );
}
