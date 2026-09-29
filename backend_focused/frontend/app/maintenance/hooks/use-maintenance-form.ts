'use client';

import { useForm } from 'react-hook-form';
import { useSaveMaintenance } from '@/hooks/api/use-maintenance';
import type { MaintenanceInput, MaintenanceRecord } from '@/lib/api/types';
import { applyFormErrors } from '@/lib/form-errors';

export type MaintenanceFormValues = Omit<MaintenanceInput, 'vehicle' | 'mechanic'> & {
  vehicle: string;
  mechanic: string;
};

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function useMaintenanceForm(record: MaintenanceRecord | null, onSaved: () => void) {
  const form = useForm<MaintenanceFormValues>({
    defaultValues: {
      vehicle: record ? String(record.vehicle) : '',
      mechanic: record ? String(record.mechanic) : '',
      maintenance_date: record?.maintenance_date ?? today(),
      maintenance_type: record?.maintenance_type ?? '',
      cost: record?.cost ?? '',
      notes: record?.notes ?? '',
    },
  });
  const save = useSaveMaintenance();
  const submit = form.handleSubmit(async (values) => {
    form.clearErrors();
    try {
      await save.mutateAsync({
        id: record?.id,
        data: {
          ...values,
          vehicle: Number(values.vehicle),
          mechanic: Number(values.mechanic),
          maintenance_type: values.maintenance_type.trim(),
          cost: values.cost.trim(),
          notes: values.notes?.trim() ?? '',
        },
      });
      onSaved();
    } catch (error) {
      applyFormErrors(error, form.setError, [
        'vehicle',
        'mechanic',
        'maintenance_date',
        'maintenance_type',
        'cost',
        'notes',
      ]);
    }
  });
  return { form, submit, isPending: save.isPending };
}
