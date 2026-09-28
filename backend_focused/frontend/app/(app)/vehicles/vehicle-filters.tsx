'use client';

import { Button, Grid, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import { modelsOfMake, vehicleModelLabel } from '@/lib/lookups';
import type { Office, VehicleMake, VehicleModel } from '@/lib/types';
import { EMPTY_FILTERS, type VehicleFilterKey, type VehicleFilters } from '@/lib/vehicle-search';

type Props = {
  initial: VehicleFilters;
  offices: Office[] | undefined;
  officesFailed: boolean;
  makes: VehicleMake[] | undefined;
  models: VehicleModel[] | undefined;
  catalogFailed: boolean;
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
 *
 * Make and model are ids. With a make chosen, the model list shows only its models, and changing
 * the make clears a model of another make. Without a make, every model is listed with its make.
 */
export default function VehicleFiltersForm({
  initial,
  offices,
  officesFailed,
  makes,
  models,
  catalogFailed,
  errors,
  onSearch,
  onClear,
}: Props) {
  const [draft, setDraft] = useState(initial);
  const modelOptions = models ? modelsOfMake(models, draft.make) : [];
  // A model id from the URL can be unknown, or belong to another make. It stays selectable so
  // the search shows what was asked for and the API error explains the problem.
  const selectedModel = models?.find((model) => String(model.id) === draft.model);
  const modelMissing =
    models !== undefined &&
    draft.model !== '' &&
    !modelOptions.some((model) => String(model.id) === draft.model);
  const makeMissing =
    makes !== undefined &&
    draft.make !== '' &&
    !makes.some((make) => String(make.id) === draft.make);

  function changeMake(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const make = event.target.value;
    setDraft((current) => {
      const keepModel =
        models !== undefined &&
        modelsOfMake(models, make).some((model) => String(model.id) === current.model);
      return { ...current, make, model: keepModel ? current.model : '' };
    });
  }

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

  function handleClear() {
    // The URL may already be empty, and then the parent does not remount this form.
    setDraft(EMPTY_FILTERS);
    onClear();
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
          <TextField
            select
            label="Make"
            {...field('make', catalogFailed ? 'Could not load makes' : undefined)}
            onChange={changeMake}
            disabled={!makes}
            slotProps={SHOW_EMPTY_OPTION}
          >
            <MenuItem value="">Any make</MenuItem>
            {makes?.map((make) => (
              <MenuItem key={make.id} value={String(make.id)}>
                {make.name}
              </MenuItem>
            ))}
            {makeMissing && <MenuItem value={draft.make}>Unknown make #{draft.make}</MenuItem>}
          </TextField>
        </Grid>
        <Grid size={CELL}>
          <TextField
            select
            label="Model"
            {...field('model', catalogFailed ? 'Could not load models' : undefined)}
            disabled={!models}
            slotProps={SHOW_EMPTY_OPTION}
          >
            <MenuItem value="">Any model</MenuItem>
            {modelOptions.map((model) => (
              <MenuItem key={model.id} value={String(model.id)}>
                {draft.make === '' ? vehicleModelLabel(model) : model.name}
              </MenuItem>
            ))}
            {modelMissing && (
              <MenuItem value={draft.model}>
                {selectedModel ? vehicleModelLabel(selectedModel) : `Unknown model #${draft.model}`}
              </MenuItem>
            )}
          </TextField>
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
            <Button onClick={handleClear}>Clear</Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
