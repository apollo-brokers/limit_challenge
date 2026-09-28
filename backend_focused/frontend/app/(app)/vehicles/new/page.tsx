'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { ErrorAlert, PageSpinner } from '@/components/query-state';
import { useNotify } from '@/app/providers';
import { apiClient } from '@/lib/api-client';
import { useOffices, useVehicleMakes, useVehicleModels } from '@/lib/lookups';
import type { Vehicle, VehicleWrite } from '@/lib/types';
import VehicleForm from '../vehicle-form';

export default function NewVehiclePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const offices = useOffices();
  const makes = useVehicleMakes();
  const models = useVehicleModels();

  const create = useMutation({
    mutationFn: async (values: VehicleWrite) =>
      (await apiClient.post<Vehicle>('/v1/vehicles/', values)).data,
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-due'] });
      notify('Vehicle created');
      router.push(`/vehicles/${vehicle.id}`);
    },
  });

  const loadError = offices.error ?? makes.error ?? models.error;

  return (
    <>
      <PageHeader title="New vehicle" back={{ href: '/vehicles', label: 'Vehicles' }} />
      {loadError ? (
        <ErrorAlert
          error={loadError}
          onRetry={() => {
            offices.refetch();
            makes.refetch();
            models.refetch();
          }}
        />
      ) : offices.data && makes.data && models.data ? (
        <VehicleForm
          offices={offices.data}
          makes={makes.data}
          models={models.data}
          submitLabel="Create vehicle"
          isPending={create.isPending}
          error={create.error}
          onSubmit={(values) => create.mutate(values)}
          cancelHref="/vehicles"
        />
      ) : (
        <PageSpinner />
      )}
    </>
  );
}
