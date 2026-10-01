'use client';

import {
  Alert,
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { parseApiError } from '@/lib/api-errors';
import { MONO_FONT } from '@/lib/format';
import { modelsOfMake } from '@/lib/lookups';
import type { Office, Vehicle, VehicleMake, VehicleModel, VehicleWrite } from '@/lib/types';

/** Select values are ids as text, `''` when nothing is chosen. */
type FormValues = {
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: string;
  office: string;
  active: boolean;
};

type TextKey = Exclude<keyof FormValues, 'active'>;

type VehicleFormProps = {
  initial?: Vehicle;
  offices: Office[];
  makes: VehicleMake[];
  models: VehicleModel[];
  submitLabel: string;
  isPending: boolean;
  error: unknown;
  onSubmit: (values: VehicleWrite) => void;
  cancelHref: string;
};

/** API field name -> form field name. */
const API_FIELDS = {
  vin: 'vin',
  license_plate: 'license_plate',
  model_id: 'model',
  year: 'year',
  office_id: 'office',
  active: 'active',
};

function toFormValues(vehicle?: Vehicle): FormValues {
  return {
    vin: vehicle?.vin ?? '',
    license_plate: vehicle?.license_plate ?? '',
    make: vehicle ? String(vehicle.make.id) : '',
    model: vehicle ? String(vehicle.model.id) : '',
    year: vehicle ? String(vehicle.year) : '',
    office: vehicle ? String(vehicle.office.id) : '',
    active: vehicle?.active ?? true,
  };
}

function toPayload(values: FormValues): VehicleWrite {
  return {
    vin: values.vin,
    license_plate: values.license_plate,
    // The make select only narrows the model list. The API derives the make from the model.
    model_id: values.model === '' ? null : Number(values.model),
    year: values.year === '' ? null : Number(values.year),
    active: values.active,
    office_id: values.office === '' ? null : Number(values.office),
  };
}

/**
 * Create/edit form for a vehicle.
 *
 * Business rules (unique VIN, one active vehicle per plate, valid year) are checked by the API.
 * Its 400 messages are shown next to the matching inputs. The model list shows only models of
 * the chosen make, and changing the make clears a model of another make.
 */
export default function VehicleForm({
  initial,
  offices,
  makes,
  models,
  submitLabel,
  isPending,
  error,
  onSubmit,
  cancelHref,
}: VehicleFormProps) {
  const [values, setValues] = useState(() => toFormValues(initial));
  const [editedFields, setEditedFields] = useState<Set<string>>(() => new Set());
  const { message, fieldErrors } = parseApiError(error, API_FIELDS);

  function fieldError(name: keyof FormValues): string | undefined {
    return editedFields.has(name) ? undefined : fieldErrors[name];
  }

  function change<K extends keyof FormValues>(name: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [name]: value }));
    setEditedFields((current) => new Set(current).add(name));
  }

  function changeMake(make: string) {
    const keepModel = modelsOfMake(models, make).some((model) => String(model.id) === values.model);
    setValues((current) => ({ ...current, make, model: keepModel ? current.model : '' }));
    setEditedFields((current) => {
      const next = new Set(current).add('make');
      return keepModel ? next : next.add('model');
    });
  }

  function textField(name: TextKey, label: string) {
    return {
      name,
      label,
      value: values[name],
      onChange: (event: { target: { value: string } }) => change(name, event.target.value),
      error: Boolean(fieldError(name)),
      helperText: fieldError(name),
      required: true,
      fullWidth: true,
    };
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEditedFields(new Set());
    onSubmit(toPayload(values));
  }

  return (
    <Paper variant="outlined" component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      {message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            {...textField('vin', 'VIN')}
            slotProps={{ htmlInput: { maxLength: 17, style: { fontFamily: MONO_FONT } } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            {...textField('license_plate', 'License plate')}
            slotProps={{ htmlInput: { maxLength: 20 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            {...textField('make', 'Make')}
            onChange={(event) => changeMake(event.target.value)}
          >
            {makes.map((make) => (
              <MenuItem key={make.id} value={String(make.id)}>
                {make.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            {...textField('model', 'Model')}
            disabled={values.make === ''}
            helperText={fieldError('model') ?? (values.make === '' ? 'Choose a make first' : '')}
          >
            {modelsOfMake(models, values.make).map((model) => (
              <MenuItem key={model.id} value={String(model.id)}>
                {model.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField {...textField('year', 'Year')} type="number" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField select {...textField('office', 'Office')}>
            {offices.map((office) => (
              <MenuItem key={office.id} value={String(office.id)}>
                {office.name} ({office.city})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            label="Active"
            control={
              <Switch
                checked={values.active}
                onChange={(event) => change('active', event.target.checked)}
              />
            }
          />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 3 }}>
        <Button component={Link} href={cancelHref} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={isPending}>
          {submitLabel}
        </Button>
      </Stack>
    </Paper>
  );
}
