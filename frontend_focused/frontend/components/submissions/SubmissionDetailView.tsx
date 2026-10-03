'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Link as MuiLink,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';

import { AppShell } from '@/components/layout/AppShell';
import { PriorityChip, StatusChip, formatDate, formatDateTime } from '@/components/submissions/status';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useFeedback } from '@/components/ui/FeedbackProvider';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';

function DetailSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}

function isSafeHttpUrl(url: string) {
  try {
    const parsed = new URL(url, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box minWidth={0}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        letterSpacing="0.04em"
        textTransform="uppercase"
        display="block"
        mb={0.5}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export function SubmissionDetailView() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { showFeedback } = useFeedback();
  const submissionId = params?.id ?? '';
  const fromQuery = searchParams.get('from');
  const backHref = fromQuery ? `/submissions?${fromQuery}` : '/submissions';

  const detailQuery = useSubmissionDetail(submissionId);
  const submission = detailQuery.data;
  const isNotFound =
    axios.isAxiosError(detailQuery.error) && detailQuery.error.response?.status === 404;

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showFeedback(`${label} copied`, 'success');
    } catch {
      showFeedback(`Could not copy ${label.toLowerCase()}`, 'error');
    }
  };

  const handleRetry = () => {
    void detailQuery.refetch();
  };

  return (
    <AppShell maxWidth="lg">
      <Stack spacing={3}>
        <PageHeader
          title={submission?.company.legalName || 'Submission detail'}
          description="Full submission context for review — contacts, documents, and notes."
          action={
            <Button
              component={Link}
              href={backHref}
              variant="outlined"
              size="medium"
              startIcon={<ArrowBackIcon />}
            >
              Back to list
            </Button>
          }
          meta={
            submission ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
                <StatusChip status={submission.status} />
                <PriorityChip priority={submission.priority} />
                <Chip size="small" label={`ID #${submission.id}`} variant="outlined" />
              </Stack>
            ) : undefined
          }
        />

        {detailQuery.isLoading ? <DetailSkeleton /> : null}

        {detailQuery.isError ? (
          <Alert
            severity={isNotFound ? 'warning' : 'error'}
            variant="outlined"
            action={
              isNotFound ? (
                <Button component={Link} href={backHref} color="inherit" size="small">
                  Back to list
                </Button>
              ) : (
                <Button color="inherit" size="small" onClick={handleRetry}>
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
            <SectionCard title="Overview" subtitle="Summary and ownership">
              <Stack spacing={2.5}>
                <Typography variant="body1" sx={{ lineHeight: 1.65, maxWidth: 760 }}>
                  {submission.summary || 'No summary provided.'}
                </Typography>

                <Divider />

                <Box
                  display="grid"
                  gap={3}
                  gridTemplateColumns={{
                    xs: '1fr',
                    sm: '1fr 1fr',
                    md: 'repeat(4, minmax(0, 1fr))',
                  }}
                >
                  <MetaItem label="Broker">
                    <Typography fontWeight={600}>{submission.broker.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {submission.broker.primaryContactEmail || 'No email on file'}
                    </Typography>
                  </MetaItem>
                  <MetaItem label="Owner">
                    <Typography fontWeight={600}>{submission.owner.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {submission.owner.email}
                    </Typography>
                  </MetaItem>
                  <MetaItem label="Company">
                    <Typography fontWeight={600}>{submission.company.legalName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[submission.company.industry, submission.company.headquartersCity]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </Typography>
                  </MetaItem>
                  <MetaItem label="Dates">
                    <Typography variant="body2" fontWeight={600}>
                      Created {formatDate(submission.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated {formatDate(submission.updatedAt)}
                    </Typography>
                  </MetaItem>
                </Box>
              </Stack>
            </SectionCard>

            <SectionCard
              title={`Contacts (${submission.contacts.length})`}
              subtitle="People associated with this opportunity"
            >
              {submission.contacts.length === 0 ? (
                <EmptyState
                  icon={<PeopleOutlineIcon />}
                  title="No contacts"
                  description="There are no contacts attached to this submission yet."
                />
              ) : (
                <>
                  <TableContainer
                    sx={{ display: { xs: 'none', sm: 'block' }, borderRadius: 2, border: 1, borderColor: 'divider' }}
                  >
                    <Table size="small" aria-label="Contacts">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell align="right" width={72} aria-label="Actions" />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {submission.contacts.map((contact) => (
                          <TableRow key={contact.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {contact.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{contact.role || '—'}</TableCell>
                            <TableCell>
                              {contact.email ? (
                                <MuiLink href={`mailto:${contact.email}`}>{contact.email}</MuiLink>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>
                              {contact.phone ? (
                                <MuiLink href={`tel:${contact.phone}`}>{contact.phone}</MuiLink>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                {contact.email ? (
                                  <Tooltip title="Copy email">
                                    <IconButton
                                      size="small"
                                      aria-label={`Copy email for ${contact.name}`}
                                      onClick={() => copyText(contact.email, 'Email')}
                                    >
                                      <ContentCopyIcon fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                ) : null}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' } }}>
                    {submission.contacts.map((contact) => (
                      <Box
                        key={contact.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
                          <Box minWidth={0}>
                            <Typography fontWeight={600}>{contact.name}</Typography>
                            <Typography variant="body2" color="text.secondary" mb={1.25}>
                              {contact.role || 'No role listed'}
                            </Typography>
                          </Box>
                          {contact.email ? (
                            <Tooltip title="Copy email">
                              <IconButton
                                size="small"
                                aria-label={`Copy email for ${contact.name}`}
                                onClick={() => copyText(contact.email, 'Email')}
                              >
                                <ContentCopyIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                        </Stack>
                        <Stack spacing={0.75}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <EmailOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} aria-hidden />
                            {contact.email ? (
                              <MuiLink href={`mailto:${contact.email}`} variant="body2" sx={{ wordBreak: 'break-word' }}>
                                {contact.email}
                              </MuiLink>
                            ) : (
                              <Typography variant="body2">—</Typography>
                            )}
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PhoneOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} aria-hidden />
                            {contact.phone ? (
                              <MuiLink href={`tel:${contact.phone}`} variant="body2">
                                {contact.phone}
                              </MuiLink>
                            ) : (
                              <Typography variant="body2">—</Typography>
                            )}
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </SectionCard>

            <SectionCard
              title={`Documents (${submission.documents.length})`}
              subtitle="Supporting files for this submission"
            >
              {submission.documents.length === 0 ? (
                <EmptyState
                  icon={<DescriptionOutlinedIcon />}
                  title="No documents"
                  description="No supporting files have been attached to this submission."
                />
              ) : (
                <Stack spacing={1.25}>
                  {submission.documents.map((document) => {
                    const href = document.fileUrl ? isSafeHttpUrl(document.fileUrl) : null;

                    return (
                    <Box
                      key={document.id}
                      sx={{
                        display: 'flex',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1.5,
                        p: 2,
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        transition: 'border-color 0.15s ease, background-color 0.15s ease',
                        '&:hover': {
                          borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" minWidth={0}>
                        <Box
                          aria-hidden
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            bgcolor: 'action.selected',
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <DescriptionOutlinedIcon fontSize="small" />
                        </Box>
                        <Box minWidth={0}>
                          <Typography fontWeight={600} noWrap title={document.title}>
                            {document.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {document.docType} · uploaded {formatDate(document.uploadedAt)}
                          </Typography>
                        </Box>
                      </Stack>
                      {href ? (
                        <Button
                          component="a"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewIcon />}
                          sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
                        >
                          Open file
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary" alignSelf="center">
                          No file URL
                        </Typography>
                      )}
                    </Box>
                    );
                  })}
                </Stack>
              )}
            </SectionCard>

            <SectionCard
              title={`Notes (${submission.notes.length})`}
              subtitle="Collaboration history on this opportunity"
            >
              {submission.notes.length === 0 ? (
                <EmptyState
                  icon={<StickyNote2OutlinedIcon />}
                  title="No notes yet"
                  description="Notes will appear here as the team discusses this submission."
                />
              ) : (
                <Stack spacing={1.5}>
                  {submission.notes.map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        pl: 2,
                        pr: 2,
                        py: 1.5,
                        borderRadius: 1.5,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        gap={0.5}
                        mb={0.75}
                      >
                        <Typography variant="subtitle2">{note.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(note.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {note.body}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </SectionCard>
          </>
        ) : null}
      </Stack>
    </AppShell>
  );
}
