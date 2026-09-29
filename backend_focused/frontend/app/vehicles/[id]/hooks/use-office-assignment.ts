'use client';

import { useForm } from 'react-hook-form';
import { useFeedback } from '@/components/feedback-provider';
import { useAssignOffice } from '@/hooks/api/use-vehicles';
import { applyFormErrors } from '@/lib/form-errors';

export function useOfficeAssignment(vehicleId: number, officeId: number) {
  const form = useForm<{ office: string }>({ values: { office: String(officeId) } });
  const mutation = useAssignOffice();
  const { notify } = useFeedback();

  const submit = form.handleSubmit(async (values) => {
    form.clearErrors();
    try {
      await mutation.mutateAsync({ id: vehicleId, office: Number(values.office) });
      form.reset(values);
      notify('Office assignment updated.');
    } catch (error) {
      applyFormErrors(error, form.setError, ['office']);
    }
  });

  return { form, submit, isPending: mutation.isPending };
}
