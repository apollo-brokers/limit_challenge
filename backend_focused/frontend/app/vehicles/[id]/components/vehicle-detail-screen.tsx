'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Grid, Stack } from '@mui/material';
import { PageHeader } from '@/components/page-header';
import { SectionTabs } from '@/components/navigation/section-tabs';
import { QueryState } from '@/components/query-state';
import { useVehicle } from '@/hooks/api/use-vehicles';
import { VehicleFormDialog } from '../../components/vehicle-form-dialog';
import { AssignOfficeForm } from './assign-office-form';
import { MaintenanceHistory } from './maintenance-history';
import { VehicleOverview } from './vehicle-overview';

export function VehicleDetailScreen({ id }: { id: number }) {
  const query = useVehicle(id);
  const [editing, setEditing] = useState(false);
  const vehicle = query.data;
  return (
    <Stack spacing={3}>
      <Button component={Link} href="/vehicles" sx={{ alignSelf: 'flex-start' }}>
        Back to vehicles
      </Button>
      <PageHeader
        title={vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle details'}
        description={vehicle ? `${vehicle.year} · ${vehicle.license_plate}` : undefined}
        navigation={<SectionTabs />}
        action={
          vehicle && (
            <Button variant="contained" onClick={() => setEditing(true)}>
              Edit vehicle
            </Button>
          )
        }
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
      />
      {vehicle && (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <VehicleOverview vehicle={vehicle} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <AssignOfficeForm vehicle={vehicle} />
            </Grid>
          </Grid>
          <MaintenanceHistory records={vehicle.maintenance_records} vehicleId={vehicle.id} />
          {editing && (
            <VehicleFormDialog
              vehicle={{ ...vehicle, office: vehicle.office.id }}
              onClose={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          )}
        </>
      )}
    </Stack>
  );
}
