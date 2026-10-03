'use client';

import { useEffect, useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  Collapse,
  InputAdornment,
  MenuItem,
  Stack,
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

  const brokerName =
    values.brokerId && brokerQuery.data
      ? brokerQuery.data.find((broker) => String(broker.id) === values.brokerId)?.name
      : undefined;

  const activeChips: { key: keyof SubmissionFilterValues; label: string }[] = [];
  if (values.status) {
    activeChips.push({
      key: 'status',
      label: `Status: ${STATUS_OPTIONS.find((o) => o.value === values.status)?.label}`,
    });
  }
  if (values.brokerId) {
    activeChips.push({
      key: 'brokerId',
      label: `Broker: ${brokerName || values.brokerId}`,
    });
  }
  if (values.companySearch) {
    activeChips.push({
      key: 'companySearch',
      label: `Company: ${values.companySearch}`,
    });
  }
  if (values.priority) {
    activeChips.push({
      key: 'priority',
      label: `Priority: ${PRIORITY_OPTIONS.find((o) => o.value === values.priority)?.label}`,
    });
  }
  if (values.createdFrom) {
    activeChips.push({ key: 'createdFrom', label: `From: ${values.createdFrom}` });
  }
  if (values.createdTo) {
    activeChips.push({ key: 'createdTo', label: `To: ${values.createdTo}` });
  }

  const hasActiveFilters = activeChips.length > 0;

  return (
    <Stack spacing={2.5}>
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <Box>
          <Typography variant="subtitle1" component="h2">
            Filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Narrow the pipeline. Filters sync to the URL automatically.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant={showAdvanced ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => onToggleAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? 'Hide more' : 'More filters'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onClear}
            disabled={!hasActiveFilters}
          >
            Clear all
          </Button>
        </Stack>
      </Box>

      <Box
        display="grid"
        gap={2}
        gridTemplateColumns={{
          xs: '1fr',
          sm: '1fr 1fr',
          md: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.3fr)',
        }}
      >
        <TextField
          select
          label="Status"
          value={values.status}
          onChange={(event) =>
            onChange({ status: event.target.value as SubmissionStatus | '' })
          }
          fullWidth
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
          placeholder="Search by company name"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" aria-hidden />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Collapse in={showAdvanced} unmountOnExit>
        <Box
          display="grid"
          gap={2}
          gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}
          sx={{ pt: 0.5 }}
        >
          <TextField
            select
            label="Priority"
            value={values.priority}
            onChange={(event) =>
              onChange({ priority: event.target.value as SubmissionPriority | '' })
            }
            fullWidth
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
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Created to"
            type="date"
            value={values.createdTo}
            onChange={(event) => onChange({ createdTo: event.target.value })}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </Collapse>

      {hasActiveFilters ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            Active:
          </Typography>
          {activeChips.map((chip) => (
            <Chip
              key={chip.key}
              size="small"
              label={chip.label}
              onDelete={() => {
                if (chip.key === 'companySearch') {
                  setCompanyInput('');
                }
                onChange({ [chip.key]: '' });
              }}
              sx={{ maxWidth: 280 }}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
