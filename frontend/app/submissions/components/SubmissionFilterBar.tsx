'use client';

import { memo, useEffect, useState, MouseEvent } from 'react';
import { 
  Card, CardContent, MenuItem, Stack, TextField, 
  Button, Popover, FormControlLabel, Switch, Box, Typography, Divider 
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { SubmissionStatus, SubmissionListFilters, Broker } from '@/lib/types';
import { UseQueryResult } from '@tanstack/react-query';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

interface Props {
  filters: SubmissionListFilters;
  updateFilter: (key: keyof SubmissionListFilters, value: string | boolean | undefined) => void;
  brokerQuery: UseQueryResult<Broker[], Error>;
}

export const SubmissionFilterBar = memo(function SubmissionFilterBar({ 
  filters, 
  updateFilter, 
  brokerQuery 
}: Props) {
  // Local state for debouncing text inputs to protect the network
  const [localSearch, setLocalSearch] = useState(filters.companySearch || '');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Debounce the company search to avoid spamming router.push
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only push if the debounced value inherently differs from the bound URL state
      if (localSearch !== (filters.companySearch || '')) {
        updateFilter('companySearch', localSearch);
      }
    }, 400); // 400ms debounce buffer
    return () => clearTimeout(timer);
  }, [localSearch, filters.companySearch, updateFilter]);

  const handleOpenFilters = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseFilters = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            select
            label="Status"
            value={filters.status ?? ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            label="Broker"
            value={filters.brokerId ?? ''}
            onChange={(e) => updateFilter('brokerId', e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
            disabled={brokerQuery.isLoading}
          >
            <MenuItem value="">All brokers</MenuItem>
            {brokerQuery.data?.map((broker) => (
              <MenuItem key={broker.id} value={String(broker.id)}>
                {broker.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            label="Company Search"
            placeholder="e.g. Acme Corp"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            fullWidth
            size="small"
          />

          <Button 
            variant={filters.hasDocuments || filters.hasNotes || filters.createdFrom || filters.createdTo ? "contained" : "outlined"}
            color="primary"
            startIcon={<FilterListIcon />} 
            onClick={handleOpenFilters}
            sx={{ whiteSpace: 'nowrap', px: 3, py: 1 }}
          >
            More
          </Button>

          <Popover
            open={popoverOpen}
            anchorEl={anchorEl}
            onClose={handleCloseFilters}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box p={3} sx={{ width: 300 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Date Constraints
              </Typography>
              <Stack spacing={2} mb={2}>
                <TextField 
                  type="date" 
                  label="Created From" 
                  size="small" 
                  InputLabelProps={{ shrink: true }}
                  value={filters.createdFrom ?? ''}
                  onChange={(e) => updateFilter('createdFrom', e.target.value)}
                />
                <TextField 
                  type="date" 
                  label="Created To" 
                  size="small" 
                  InputLabelProps={{ shrink: true }}
                  value={filters.createdTo ?? ''}
                  onChange={(e) => updateFilter('createdTo', e.target.value)}
                />
              </Stack>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Attachments Required
              </Typography>
              <Stack>
                <FormControlLabel
                  control={<Switch size="small" checked={!!filters.hasDocuments} onChange={(e) => updateFilter('hasDocuments', e.target.checked)} />}
                  label="Has Documents"
                />
                <FormControlLabel
                  control={<Switch size="small" checked={!!filters.hasNotes} onChange={(e) => updateFilter('hasNotes', e.target.checked)} />}
                  label="Has Notes"
                />
              </Stack>
            </Box>
          </Popover>
        </Stack>
      </CardContent>
    </Card>
  );
});
