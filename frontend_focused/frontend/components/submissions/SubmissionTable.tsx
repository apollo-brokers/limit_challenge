'use client';

import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import { PriorityChip, StatusChip, formatDate } from '@/components/submissions/status';
import { SubmissionListItem } from '@/lib/types';

interface SubmissionTableProps {
  rows: SubmissionListItem[];
  queryString?: string;
}

export function SubmissionTable({ rows, queryString = '' }: SubmissionTableProps) {
  const router = useRouter();

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 2, overflow: 'hidden' }}
    >
      <Table size="medium" aria-label="Submissions">
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
            const href = queryString
              ? `/submissions/${row.id}?from=${encodeURIComponent(queryString)}`
              : `/submissions/${row.id}`;

            return (
              <TableRow
                key={row.id}
                hover
                sx={{
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => router.push(href)}
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
                  <Chip label={row.documentCount} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Chip label={row.noteCount} size="small" variant="outlined" />
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
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(row.createdAt)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
