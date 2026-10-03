'use client';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import { PriorityChip, StatusChip, formatDate } from '@/components/submissions/status';
import { SubmissionListItem } from '@/lib/types';

interface SubmissionTableProps {
  rows: SubmissionListItem[];
  queryString?: string;
}

function buildHref(id: number, queryString: string) {
  return queryString
    ? `/submissions/${id}?from=${encodeURIComponent(queryString)}`
    : `/submissions/${id}`;
}

function SubmissionMobileCards({
  rows,
  queryString,
}: {
  rows: SubmissionListItem[];
  queryString: string;
}) {
  const router = useRouter();

  return (
    <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
      {rows.map((row) => (
        <Paper
          key={row.id}
          variant="outlined"
          role="button"
          tabIndex={0}
          aria-label={`Open submission for ${row.company.legalName}`}
          onClick={() => router.push(buildHref(row.id, queryString))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              router.push(buildHref(row.id, queryString));
            }
          }}
          sx={{
            p: 2,
            cursor: 'pointer',
            borderRadius: 2,
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
            '&:hover, &:focus-visible': {
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
            },
          }}
        >
          <Stack spacing={1.5}>
            <Box display="flex" justifyContent="space-between" gap={1.5} alignItems="flex-start">
              <Box minWidth={0}>
                <Typography variant="subtitle1" noWrap>
                  {row.company.legalName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {row.company.industry || '—'}
                  {row.company.headquartersCity ? ` · ${row.company.headquartersCity}` : ''}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                {formatDate(row.createdAt)}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <StatusChip status={row.status} />
              <PriorityChip priority={row.priority} />
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Typography variant="body2" color="text.secondary">
                Broker · {row.broker.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Owner · {row.owner.fullName}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                variant="outlined"
                icon={<DescriptionOutlinedIcon />}
                label={`${row.documentCount} docs`}
              />
              <Chip
                size="small"
                variant="outlined"
                icon={<NotesOutlinedIcon />}
                label={`${row.noteCount} notes`}
              />
            </Stack>

            {row.latestNote ? (
              <Box
                sx={{
                  pt: 1,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  Latest note · {row.latestNote.authorName}
                </Typography>
                <Typography variant="body2" noWrap title={row.latestNote.bodyPreview}>
                  {row.latestNote.bodyPreview}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export function SubmissionTable({ rows, queryString = '' }: SubmissionTableProps) {
  const router = useRouter();

  return (
    <>
      <SubmissionMobileCards rows={rows} queryString={queryString} />

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          display: { xs: 'none', md: 'block' },
          borderRadius: 2,
          overflow: 'auto',
        }}
      >
        <Table size="medium" aria-label="Submissions" sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Broker</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell align="right">Docs</TableCell>
              <TableCell align="right">Notes</TableCell>
              <TableCell>Latest note</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const href = buildHref(row.id, queryString);

              return (
                <TableRow
                  key={row.id}
                  hover
                  tabIndex={0}
                  aria-label={`Open submission for ${row.company.legalName}`}
                  sx={{
                    cursor: 'pointer',
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: -2,
                    },
                  }}
                  onClick={() => router.push(href)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(href);
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.company.legalName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.company.industry || '—'}
                      {row.company.headquartersCity
                        ? ` · ${row.company.headquartersCity}`
                        : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityChip priority={row.priority} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.broker.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.owner.fullName}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      {row.documentCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      {row.noteCount}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    {row.latestNote ? (
                      <>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {row.latestNote.authorName}
                        </Typography>
                        <Typography
                          variant="body2"
                          noWrap
                          title={row.latestNote.bodyPreview}
                        >
                          {row.latestNote.bodyPreview}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" whiteSpace="nowrap">
                      {formatDate(row.createdAt)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
