'use client';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import {
  Alert,
  Button,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { EmptyState } from '@/components/ui/EmptyState';

interface SubmissionListStatesProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  onClearFilters?: () => void;
}

export function SubmissionListSkeleton() {
  return (
    <>
      <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={148} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 2 }}
      >
        <Table aria-hidden>
          <TableHead>
            <TableRow>
              {['Company', 'Status', 'Priority', 'Broker', 'Owner', 'Docs', 'Notes', 'Latest note', 'Created'].map(
                (label) => (
                  <TableCell key={label}>{label}</TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton width="70%" />
                  <Skeleton width="45%" sx={{ mt: 0.5 }} />
                </TableCell>
                <TableCell>
                  <Skeleton width={72} height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton width={64} height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton width="80%" />
                </TableCell>
                <TableCell>
                  <Skeleton width="75%" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton width={20} sx={{ ml: 'auto' }} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton width={20} sx={{ ml: 'auto' }} />
                </TableCell>
                <TableCell>
                  <Skeleton width="90%" />
                </TableCell>
                <TableCell>
                  <Skeleton width={80} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export function SubmissionListStates({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  onClearFilters,
}: SubmissionListStatesProps) {
  if (isLoading) {
    return <SubmissionListSkeleton />;
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        variant="outlined"
        icon={<ErrorOutlineIcon />}
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        Could not load submissions. Check that the API is running and try again.
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={<InboxOutlinedIcon />}
        title="No submissions match"
        description="Try clearing filters or broadening your company search to see more opportunities in the pipeline."
        actionLabel={onClearFilters ? 'Clear filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return null;
}
