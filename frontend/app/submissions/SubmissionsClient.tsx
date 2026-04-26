'use client';

import { Box, Stack, Typography } from '@mui/material';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { useSubmissionFilters } from '@/lib/hooks/useSubmissionFilters';
import { SubmissionList } from './components/SubmissionList';
import { SubmissionFilterBar } from './components/SubmissionFilterBar';

/**
 * Top-level dynamic client component acting as the orchestrator for Submissions data.
 * Adheres strictly to container-presenter patterns by abstracting away the heavy UI into isolated components.
 */
export default function SubmissionsClient() {
  const { filters, updateFilter } = useSubmissionFilters();
  
  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Submissions
        </Typography>
        <Typography color="text.secondary" mt={1}>
          Review incoming opportunities and filter by status, broker, or company.
        </Typography>
      </Box>

      <SubmissionFilterBar 
        filters={filters} 
        updateFilter={updateFilter} 
        brokerQuery={brokerQuery} 
      />

      <Box>
        <SubmissionList query={submissionsQuery} />
      </Box>
    </Stack>
  );
}
