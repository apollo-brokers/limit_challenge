'use client';

import { Button } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { EmptyState, ErrorAlert, PageSpinner } from '@/components/query-state';
import { useNotify } from '@/app/providers';
import { apiClient } from '@/lib/api-client';
import { getErrorStatus } from '@/lib/api-errors';
import { useOffices, useVehicleMakes, useVehicleModels } from '@/lib/lookups';
import type { Vehicle, VehicleDetail, VehicleWrite } from '@/lib/types';
import VehicleForm from '../../vehicle-form';

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const offices = useOffices();
  const makes = useVehicleMakes();
  const models = useVehicleModels();

  const vehicle = useQuery({
    queryKey: ['vehicles', 'detail', id],
    queryFn: async () => (await apiClient.get<VehicleDetail>(`/v1/vehicles/${id}/`)).data,
  });

  const update = useMutation({
    mutationFn: async (values: VehicleWrite) =>
      (await apiClient.put<Vehicle>(`/v1/vehicles/${id}/`, values)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-due'] });
      notify('Vehicle updated');
      router.push(`/vehicles/${id}`);
    },
  });

  if (getErrorStatus(vehicle.error) === 404) {
    return (
      <EmptyState
        title="Vehicle not found"
        description="It may have been deleted."
        action={
          <Button component={Link} href="/vehicles">
            Back to vehicles
          </Button>
        }
      />
    );
  }

  const loadError = vehicle.error ?? offices.error ?? makes.error ?? models.error;

  return (
    <>
      <PageHeader
        title={vehicle.data ? `Edit ${vehicle.data.license_plate}` : 'Edit vehicle'}
        back={{ href: `/vehicles/${id}`, label: 'Vehicle' }}
      />
      {loadError ? (
        <ErrorAlert
          error={loadError}
          onRetry={() => {
            vehicle.refetch();
            offices.refetch();
            makes.refetch();
            models.refetch();
          }}
        />
      ) : vehicle.data && offices.data && makes.data && models.data ? (
        <VehicleForm
          initial={vehicle.data}
          offices={offices.data}
          makes={makes.data}
          models={models.data}
          submitLabel="Save changes"
          isPending={update.isPending}
          error={update.error}
          onSubmit={(values) => update.mutate(values)}
          cancelHref={`/vehicles/${id}`}
        />
      ) : (
        <PageSpinner />
      )}
    </>
  );
}
