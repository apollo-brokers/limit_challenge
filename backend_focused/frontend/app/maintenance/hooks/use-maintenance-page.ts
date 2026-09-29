'use client';

import { useState } from 'react';
import { useFeedback } from '@/components/feedback-provider';
import { useDeleteMaintenance, useMaintenanceRecords } from '@/hooks/api/use-maintenance';
import { useMechanicOptions } from '@/hooks/api/use-mechanics';
import { useVehicleOptions } from '@/hooks/api/use-vehicles';
import type { MaintenanceRecord } from '@/lib/api/types';
import { useMaintenanceFilters } from './use-maintenance-filters';

export function useMaintenancePage() {
  const search = useMaintenanceFilters();
  const { page, setPage } = search;
  const records = useMaintenanceRecords(search.filters);
  const mechanics = useMechanicOptions();
  const vehicles = useVehicleOptions();
  const deletion = useDeleteMaintenance();
  const { notify } = useFeedback();
  const [editing, setEditing] = useState<MaintenanceRecord | null | undefined>();
  const [viewing, setViewing] = useState<MaintenanceRecord | null>(null);
  const [deleting, setDeleting] = useState<MaintenanceRecord | null>(null);

  function requestDelete(record: MaintenanceRecord) {
    deletion.reset();
    setDeleting(record);
  }
  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deletion.mutateAsync(deleting.id);
      setDeleting(null);
      notify('Maintenance record deleted.');
      if (records.data?.results?.length === 1 && page > 1) setPage(page - 1);
    } catch {
      /* Keep the confirmation open with the API error. */
    }
  }
  function onSaved() {
    notify(editing ? 'Maintenance record updated.' : 'Maintenance record created.');
    if (search.hasFilters) setPage(1);
    else if (!editing) setPage(Math.max(1, Math.ceil(((records.data?.count ?? 0) + 1) / 10)));
    setEditing(undefined);
  }
  return {
    search,
    page,
    setPage,
    records,
    mechanics,
    vehicles,
    editing,
    setEditing,
    viewing,
    setViewing,
    deleting,
    setDeleting,
    deletion,
    requestDelete,
    confirmDelete,
    onSaved,
  };
}
