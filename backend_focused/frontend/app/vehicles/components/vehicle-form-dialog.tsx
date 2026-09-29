'use client';

import { Alert, Button, Dialog, DialogActions, DialogContent, Grid, Stack } from '@mui/material';
import { FormProvider } from 'react-hook-form';
import { RHFAsyncAutocomplete } from '@/components/forms/rhf-async-autocomplete';
import { RHFSwitch } from '@/components/forms/rhf-switch';
import { RHFTextField } from '@/components/forms/rhf-text-field';
import { MascotDialogTitle } from '@/components/mascot/mascot-dialog-title';
import { officeAutocomplete } from '@/lib/api/autocomplete';
import type { Vehicle } from '@/lib/api/types';
import { useVehicleForm, type VehicleFormValues } from '../hooks/use-vehicle-form';

type Props = {
  vehicle?: Vehicle;
  onClose: () => void;
  onSaved: (saved: Vehicle) => void;
};

export function VehicleFormDialog({ vehicle, onClose, onSaved }: Props) {
  const { form, submit, isPending } = useVehicleForm(vehicle, onSaved);
  const serverError = form.formState.errors.root?.server?.message;

  return (
    <Dialog
      open
      onClose={isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="vehicle-form-title"
    >
      <FormProvider {...form}>
        <form onSubmit={submit} noValidate>
          <MascotDialogTitle id="vehicle-form-title">
            {vehicle ? 'Edit vehicle' : 'Add vehicle'}
          </MascotDialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RHFTextField<VehicleFormValues>
                    name="make"
                    label="Make"
                    required
                    rules={{
                      required: 'Enter the make.',
                      maxLength: { value: 100, message: 'Use 100 characters or fewer.' },
                      validate: (value) => Boolean(String(value).trim()) || 'Enter the make.',
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RHFTextField<VehicleFormValues>
                    name="model"
                    label="Model"
                    required
                    rules={{
                      required: 'Enter the model.',
                      maxLength: { value: 100, message: 'Use 100 characters or fewer.' },
                      validate: (value) => Boolean(String(value).trim()) || 'Enter the model.',
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RHFTextField<VehicleFormValues>
                    name="year"
                    label="Year"
                    type="number"
                    required
                    rules={{
                      required: 'Enter the year.',
                      min: { value: 0, message: 'Year must be zero or greater.' },
                      max: { value: 32767, message: 'Year must be 32767 or less.' },
                      validate: (value) =>
                        Number.isInteger(Number(value)) || 'Enter a whole number.',
                    }}
                    slotProps={{ htmlInput: { min: 0, max: 32767, step: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RHFTextField<VehicleFormValues>
                    name="license_plate"
                    label="License plate"
                    required
                    rules={{
                      required: 'Enter the license plate.',
                      maxLength: { value: 20, message: 'Use 20 characters or fewer.' },
                      validate: (value) =>
                        Boolean(String(value).trim()) || 'Enter the license plate.',
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <RHFTextField<VehicleFormValues>
                    name="vin"
                    label="VIN"
                    required
                    rules={{
                      required: 'Enter the VIN.',
                      maxLength: { value: 17, message: 'Use 17 characters or fewer.' },
                      validate: (value) => Boolean(String(value).trim()) || 'Enter the VIN.',
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <RHFAsyncAutocomplete<VehicleFormValues>
                    name="office"
                    label="Office"
                    required
                    rules={{ required: 'Choose an office.' }}
                    source={officeAutocomplete}
                  />
                </Grid>
                <Grid size={12}>
                  <RHFSwitch<VehicleFormValues> name="active" label="Active vehicle" />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={isPending}>
              {vehicle ? 'Save changes' : 'Create vehicle'}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
