'use client';

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { useRouter } from 'next/navigation';

import { SubmissionListItem, SubmissionStatus, SubmissionPriority } from '@/lib/types';
import { memo } from 'react';

const statusColor = (status: SubmissionStatus) => {
  switch (status) {
    case 'new': return 'info';
    case 'in_review': return 'warning';
    case 'closed': return 'success';
    case 'lost': return 'error';
    default: return 'default';
  }
};

const priorityColor = (priority: SubmissionPriority) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

interface Props {
  sub: SubmissionListItem;
}

/**
 * Isolated presentational component rendering a single Submission list item.
 * Strictly typed and encapsulated to handle local router redirection.
 */
export const SubmissionCard = memo(function SubmissionCard({ sub }: Props) {
  const router = useRouter();

  return (
    <Card variant="outlined" sx={{ transition: '0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: 2 } }}>
      <CardActionArea onClick={() => router.push(`/submissions/${sub.id}`)}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BusinessIcon color="action" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {sub.company.legalName}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Broker: {sub.broker.name}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  <Chip label={sub.status.replace('_', ' ').toUpperCase()} size="small" color={statusColor(sub.status)} />
                  <Chip label={sub.priority.toUpperCase()} size="small" variant="outlined" color={priorityColor(sub.priority)} />
                </Box>
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Summary
                </Typography>
                <Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {sub.summary || 'No summary provided.'}
                </Typography>
                {sub.latestNote && (
                  <Box bgcolor="grey.50" p={1.5} borderRadius={1} mt={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Latest Note from {sub.latestNote.authorName}:
                    </Typography>
                    <Typography variant="body2" noWrap>
                      "{sub.latestNote.bodyPreview}..."
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Stack direction="row" spacing={3} height="100%" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center">
                <Box display="flex" alignItems="center" gap={0.5} title="Documents">
                  <DescriptionIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight="medium">{sub.documentCount}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} title="Notes">
                  <ChatBubbleOutlineIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight="medium">{sub.noteCount}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} title="Created Date">
                  <Typography variant="caption" color="text.secondary">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});
