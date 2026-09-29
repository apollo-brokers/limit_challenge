'use client';

import { useForm } from 'react-hook-form';
import { useSaveMechanic } from '@/hooks/api/use-mechanics';
import type { Mechanic, MechanicInput } from '@/lib/api/types';
import { applyFormErrors } from '@/lib/form-errors';

export function useMechanicForm(mechanic: Mechanic | null, onSaved: () => void) {
  const form = useForm<MechanicInput>({
    defaultValues: {
      name: mechanic?.name ?? '',
      certification_number: mechanic?.certification_number ?? '',
      active: mechanic?.active ?? true,
    },
  });
  const save = useSaveMechanic();

  const submit = form.handleSubmit(async (data) => {
    form.clearErrors();
    try {
      await save.mutateAsync({
        id: mechanic?.id,
        data: {
          name: data.name.trim(),
          certification_number: data.certification_number.trim(),
          active: data.active,
        },
      });
      onSaved();
    } catch (error) {
      applyFormErrors(error, form.setError, ['name', 'certification_number', 'active']);
    }
  });

  return { form, submit, isPending: save.isPending };
}
