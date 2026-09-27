'use client';

import { Button, Grid, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import type { Office } from '@/lib/types';
import type { VehicleFilterKey, VehicleFilters } from '@/lib/vehicle-search';

type Props = {
  initial: VehicleFilters;
  offices: Office[] | undefined;
  officesFailed: boolean;
  errors: Record<string, string>;
  onSearch: (filters: VehicleFilters) => void;
  onClear: () => void;
};

const CELL = { xs: 12, sm: 6, md: 3 };

// Show the "Any ..." option label for the empty value, with the field label kept above it.
const SHOW_EMPTY_OPTION = { select: { displayEmpty: true }, inputLabel: { shrink: true } };

/**
 * Vehicle search form. Edits stay in a local draft until the user submits.
 *
 * The parent remounts it (via `key`) when the URL filters change, so the draft always starts from
 * the current URL, including after browser back and forward.
 */
export default function VehicleFiltersForm({
  initial,
  offices,
  officesFailed,
  errors,
  onSearch,
  onClear,
}: Props) {
  const [draft, setDraft] = useState(initial);

  function field(key: VehicleFilterKey, hint?: string) {
    return {
      name: key,
      value: draft[key],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft((current) => ({ ...current, [key]: event.target.value })),
      error: Boolean(errors[key]),
      helperText: errors[key] ?? hint,
      size: 'small' as const,
      fullWidth: true,
    };
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch(draft);
  }

  return (
    <Paper variant="outlined" component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={CELL}>
          <TextField
            select
            label="Office"
            {...field('office', officesFailed ? 'Could not load offices' : undefined)}
            disabled={!offices}
            slotProps={SHOW_EMPTY_OPTION}
          >
            <MenuItem value="">Any office</MenuItem>
            {offices?.map((office) => (
              <MenuItem key={office.id} value={String(office.id)}>
                {office.name} ({office.city})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={CELL}>
          <TextField select label="Status" {...field('active')} slotProps={SHOW_EMPTY_OPTION}>
            <MenuItem value="">Any status</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </Grid>
        <Grid size={CELL}>
          <TextField label="Make" {...field('make', 'Exact match')} />
        </Grid>
        <Grid size={CELL}>
          <TextField label="Model" {...field('model', 'Exact match')} />
        </Grid>
        <Grid size={CELL}>
          <TextField
            type="date"
            label="Maintained from"
            {...field('maintained_from')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={CELL}>
          <TextField
            type="date"
            label="Maintained to"
            {...field('maintained_to')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={CELL}>
          <TextField label="Mechanic certification #" {...field('mechanic_certification')} />
        </Grid>
        <Grid size={CELL}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained">
              Search
            </Button>
            <Button onClick={onClear}>Clear</Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
