'use client';

import { Grid } from '@mui/material';
import { FormProvider } from 'react-hook-form';
import { FilterPanel } from '@/components/filter-panel';
import { RHFSelect } from '@/components/forms/rhf-select';
import { RHFTextField } from '@/components/forms/rhf-text-field';
import { MechanicFilterValues, useMechanicFilters } from '../hooks/use-mechanic-filters';

export function MechanicFilters({ search }: { search: ReturnType<typeof useMechanicFilters> }) {
  return (
    <FormProvider {...search.form}>
      <FilterPanel
        title="Search mechanics"
        description="Search by name or certification number and combine with availability."
        onSubmit={search.form.handleSubmit(search.apply)}
        onClear={search.reset}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <RHFTextField<MechanicFilterValues>
              name="search"
              label="Search"
              placeholder="Name or certification number"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <RHFSelect<MechanicFilterValues>
              name="active"
              label="Status"
              options={[
                { value: '', label: 'All statuses' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
            />
          </Grid>
        </Grid>
      </FilterPanel>
    </FormProvider>
  );
}
