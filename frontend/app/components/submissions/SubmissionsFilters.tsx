'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  MenuItem,
  Autocomplete,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';

import { STATUS_OPTIONS } from '@/lib/utils/submission-utils';
import { useRouter } from 'next/navigation';
import { Broker, PaginatedResponse } from '@/lib/types';
import { ValidationErrorSnackbar } from '../ui';

interface SubmissionsFiltersProps {
  status: string;
  companySearchInput: string;
  hasDocuments: string;
  hasNotes: string;
  createdFrom: string;
  createdTo: string;
  updateFilter: (key: string, value: string) => void;
  setCompanySearchInput: (value: string) => void;
  brokerQuery: UseQueryResult<PaginatedResponse<Broker>, Error>;
  brokerQueryData: PaginatedResponse<Broker> | undefined;
  selectedBroker: Broker | null;
}

export function SubmissionsFiltersComponent({
  status,
  companySearchInput,
  hasDocuments,
  hasNotes,
  createdFrom,
  createdTo,
  updateFilter,
  setCompanySearchInput,
  brokerQuery,
  brokerQueryData,
  selectedBroker,
}: SubmissionsFiltersProps) {
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleDateChange = (key: string, value: string) => {
    const fromDate = key === 'createdFrom' ? value : createdFrom;
    const toDate = key === 'createdTo' ? value : createdTo;

    // Validate date range if both dates are set
    if (fromDate && toDate && fromDate > toDate) {
      setSnackbarOpen(true);
      return;
    }

    updateFilter(key, value);
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            {/* Row 1: Primary filters */}
            <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={2}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => updateFilter('status', e.target.value)}
                fullWidth
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <Autocomplete
                options={brokerQueryData?.results ?? []}
                getOptionLabel={(option) => (typeof option === 'string' ? '' : option.name)}
                value={selectedBroker}
                onChange={(event, newValue) => {
                  updateFilter('brokerId', newValue ? String(newValue.id) : '');
                }}
                loading={brokerQuery.isLoading}
                disabled={brokerQuery.isLoading || brokerQuery.isError}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Broker"
                    error={brokerQuery.isError}
                    helperText={
                      brokerQuery.isError
                        ? 'Failed to load brokers. Try again.'
                        : brokerQuery.isLoading
                          ? 'Loading brokers...'
                          : ''
                    }
                  />
                )}
                fullWidth
              />

              <TextField
                label="Company search"
                value={companySearchInput}
                onChange={(e) => setCompanySearchInput(e.target.value)}
                fullWidth
              />
            </Stack>

            {/* Row 2: Optional filters */}
            <Stack direction={{ xs: 'column', md: 'column' }} spacing={2}>
              <TextField
                type="date"
                label="Created From"
                value={createdFrom}
                onChange={(e) => handleDateChange('createdFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                type="date"
                label="Created To"
                value={createdTo}
                onChange={(e) => handleDateChange('createdTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasDocuments === 'true'}
                    onChange={(e) => updateFilter('hasDocuments', e.target.checked ? 'true' : '')}
                  />
                }
                label="Has Documents"
                slotProps={{ typography: { color: 'text.secondary' } }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasNotes === 'true'}
                    onChange={(e) => updateFilter('hasNotes', e.target.checked ? 'true' : '')}
                  />
                }
                label="Has Notes"
                slotProps={{ typography: { color: 'text.secondary' } }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="flex-end">
        <Button variant="outlined" size="small" onClick={() => router.push('/submissions')}>
          Clear filters
        </Button>
      </Box>

      <ValidationErrorSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message='"From" date cannot be after "To" date'
        severity="error"
      />
    </Stack>
  );
}

export const SubmissionsFilters = React.memo(SubmissionsFiltersComponent);
