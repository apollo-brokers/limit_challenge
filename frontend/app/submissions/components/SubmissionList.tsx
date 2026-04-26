'use client';

import {
  Box,
  Button,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { UseQueryResult } from '@tanstack/react-query';

import { PaginatedResponse, SubmissionListItem } from '@/lib/types';
import { SubmissionCard } from './SubmissionCard';
import { useSubmissionFilters } from '@/lib/hooks/useSubmissionFilters';

interface Props {
  query: UseQueryResult<PaginatedResponse<SubmissionListItem>, Error>;
}

export function SubmissionList({ query }: Props) {
  const { filters, updateFilter } = useSubmissionFilters();

  if (query.isLoading) {
    return (
      <Stack spacing={2} sx={{ opacity: 0.7, transition: 'opacity 0.2s' }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={160} sx={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </Stack>
    );
  }

  if (query.isError) {
    return (
      <Box p={4} textAlign="center" borderRadius={2} border={1} borderColor="error.light" bgcolor="error.50">
        <Typography color="error.main" fontWeight="bold">Failed to load submissions</Typography>
        <Typography variant="body2" color="error.main" mb={2}>An unexpected error occurred while fetching data.</Typography>
        <Button variant="outlined" color="error" onClick={() => query.refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  const submissions = query.data?.results || [];
  const maxPage = Math.ceil((query.data?.count || 0) / 10);

  if (submissions.length === 0) {
    return (
      <Box p={8} textAlign="center" borderRadius={2} bgcolor="background.paper" border={1} borderColor="divider" display="flex" flexDirection="column" alignItems="center">
        <FindInPageIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.primary" fontWeight="bold">
          No submissions found
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          We couldn't find any submissions matching your current active filters.
        </Typography>
        <Button variant="outlined" onClick={() => {
          // Clear routing completely 
          window.location.href = '/submissions';
        }}>
          Clear all filters
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={3} sx={{ opacity: query.isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {submissions.map((sub: SubmissionListItem) => (
          <SubmissionCard key={sub.id} sub={sub} />
        ))}
      </Stack>
      
      {maxPage > 1 && (
        <Box display="flex" justifyContent="center" pt={2} pb={4}>
          <Pagination 
            count={maxPage} 
            page={filters.page || 1} 
            onChange={(_, value) => updateFilter('page', value)} 
            color="primary"
            variant="outlined" 
            shape="rounded"
          />
        </Box>
      )}
    </Stack>
  );
}
