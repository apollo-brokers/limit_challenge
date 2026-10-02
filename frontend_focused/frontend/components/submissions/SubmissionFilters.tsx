'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const PRIORITY_OPTIONS: { label: string; value: SubmissionPriority | '' }[] = [
  { label: 'All priorities', value: '' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

export interface SubmissionFilterValues {
  status: SubmissionStatus | '';
  brokerId: string;
  companySearch: string;
  priority: SubmissionPriority | '';
  createdFrom: string;
  createdTo: string;
}

interface SubmissionFiltersProps {
  values: SubmissionFilterValues;
  onChange: (next: Partial<SubmissionFilterValues>) => void;
  onClear: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: (open: boolean) => void;
}

export function SubmissionFilters({
  values,
  onChange,
  onClear,
  showAdvanced,
  onToggleAdvanced,
}: SubmissionFiltersProps) {
  const brokerQuery = useBrokerOptions();
  const [companyInput, setCompanyInput] = useState(values.companySearch);

  useEffect(() => {
    setCompanyInput(values.companySearch);
  }, [values.companySearch]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (companyInput !== values.companySearch) {
        onChange({ companySearch: companyInput });
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [companyInput, onChange, values.companySearch]);

  const hasActiveFilters = Boolean(
    values.status ||
      values.brokerId ||
      values.companySearch ||
      values.priority ||
      values.createdFrom ||
      values.createdTo,
  );

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Filters
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Refine the pipeline. Changes apply to the URL and refresh results automatically.
        </Typography>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Status"
          value={values.status}
          onChange={(event) =>
            onChange({ status: event.target.value as SubmissionStatus | '' })
          }
          fullWidth
          size="small"
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value || 'all-status'} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Broker"
          value={values.brokerId}
          onChange={(event) => onChange({ brokerId: event.target.value })}
          fullWidth
          size="small"
          disabled={brokerQuery.isLoading}
          error={brokerQuery.isError}
          helperText={
            brokerQuery.isError
              ? 'Could not load brokers. Check that the API is running.'
              : undefined
          }
        >
          <MenuItem value="">All brokers</MenuItem>
          {brokerQuery.data?.map((broker) => (
            <MenuItem key={broker.id} value={String(broker.id)}>
              {broker.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Company search"
          value={companyInput}
          onChange={(event) => setCompanyInput(event.target.value)}
          fullWidth
          size="small"
          placeholder="Search by company name"
        />
      </Stack>

      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
        <FormControlLabel
          control={
            <Switch
              checked={showAdvanced}
              onChange={(event) => onToggleAdvanced(event.target.checked)}
              size="small"
            />
          }
          label="More filters"
        />
        <Button
          variant={hasActiveFilters ? 'outlined' : 'text'}
          onClick={onClear}
          disabled={!hasActiveFilters}
        >
          Clear filters
        </Button>
      </Box>

      {showAdvanced ? (
        <>
          <Divider />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            select
            label="Priority"
            value={values.priority}
            onChange={(event) =>
              onChange({ priority: event.target.value as SubmissionPriority | '' })
            }
            fullWidth
            size="small"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'all-priority'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Created from"
            type="date"
            value={values.createdFrom}
            onChange={(event) => onChange({ createdFrom: event.target.value })}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Created to"
            type="date"
            value={values.createdTo}
            onChange={(event) => onChange({ createdTo: event.target.value })}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
        </>
      ) : null}
    </Stack>
  );
}
