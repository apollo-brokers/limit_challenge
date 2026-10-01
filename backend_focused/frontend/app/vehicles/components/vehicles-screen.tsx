'use client';

import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { Alert, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { useFeedback } from '@/components/feedback-provider';
import { ListPagination } from '@/components/list-pagination';
import { MascotButton } from '@/components/mascot/mascot-button';
import { PageHeader } from '@/components/page-header';
import { SectionTabs } from '@/components/navigation/section-tabs';
import { QueryState } from '@/components/query-state';
import { useOfficeOptions } from '@/hooks/api/use-offices';
import { useDeleteVehicle, useVehicles } from '@/hooks/api/use-vehicles';
import type { Vehicle } from '@/lib/api/types';
import { useVehicleFilters } from '../hooks/use-vehicle-filters';
import { VehicleFilters } from './vehicle-filters';
import { VehicleFormDialog } from './vehicle-form-dialog';
import { VehicleTable } from './vehicle-table';

export function VehiclesScreen() {
  const router = useRouter();
  const search = useVehicleFilters();
  const vehicles = useVehicles(search.filters);
  const offices = useOfficeOptions();
  const deletion = useDeleteVehicle();
  const { notify } = useFeedback();
  const [editing, setEditing] = useState<Vehicle | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  function onSaved(saved: Vehicle) {
    if (editing === 'new') router.push(`/vehicles/${saved.id}`);
    else search.setPage(1);
    setEditing(null);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deletion.mutateAsync(deleting.id);
      setDeleting(null);
      notify('Vehicle deleted.');
      if (vehicles.data?.results?.length === 1 && search.page > 1) search.setPage(search.page - 1);
    } catch {
      // The confirmation dialog keeps the API error visible and allows retrying.
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Vehicles"
        navigation={<SectionTabs />}
        description="Manage the fleet, find vehicles and review their maintenance history."
        action={<MascotButton onClick={() => setEditing('new')}>Add vehicle</MascotButton>}
      />
      <VehicleFilters search={search} />
      <QueryState
        isPending={vehicles.isPending}
        isError={vehicles.isError}
        error={vehicles.error}
        onRetry={() => vehicles.refetch()}
      />
      {vehicles.isError && search.page > 1 && (
        <Button onClick={() => search.setPage(1)}>Return to first page</Button>
      )}
      {vehicles.isFetching && !vehicles.isPending && (
        <LinearProgress aria-label="Refreshing vehicles" />
      )}
      {vehicles.isSuccess && (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {vehicles.data.count} vehicles found
          </Typography>
          {vehicles.data.results?.length ? (
            <VehicleTable
              vehicles={vehicles.data.results}
              offices={offices.data ?? []}
              onEdit={setEditing}
              onDelete={(vehicle) => {
                deletion.reset();
                setDeleting(vehicle);
              }}
            />
          ) : (
            <Alert severity="info">
              No vehicles match these filters. Try clearing the filters or add a vehicle.
            </Alert>
          )}
          <ListPagination
            page={search.page}
            count={vehicles.data.count ?? 0}
            onPageChange={search.setPage}
          />
        </Stack>
      )}
      {editing && (
        <VehicleFormDialog
          vehicle={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        title="Delete vehicle?"
        description={`Delete ${deleting?.make ?? ''} ${deleting?.model ?? ''} (${deleting?.license_plate ?? ''})? Vehicles with maintenance records cannot be deleted.`}
        isPending={deletion.isPending}
        error={deletion.error}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
