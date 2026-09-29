'use client';

import { Grid } from '@mui/material';
import { FormProvider } from 'react-hook-form';
import { FilterPanel } from '@/components/filter-panel';
import { RHFTextField } from '@/components/forms/rhf-text-field';
import { OfficeFilterValues, useOfficeFilters } from '../hooks/use-office-filters';

export function OfficeFilters({ search }: { search: ReturnType<typeof useOfficeFilters> }) {
  return (
    <FormProvider {...search.form}>
      <FilterPanel
        title="Search offices"
        description="Find an office by name or city."
        onSubmit={search.form.handleSubmit(search.apply)}
        onClear={search.reset}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <RHFTextField<OfficeFilterValues>
              name="search"
              label="Search"
              placeholder="Name or city"
            />
          </Grid>
        </Grid>
      </FilterPanel>
    </FormProvider>
  );
}
