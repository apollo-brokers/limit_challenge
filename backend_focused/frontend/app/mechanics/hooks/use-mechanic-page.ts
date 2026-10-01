'use client';

import { useState } from 'react';
import { useFeedback } from '@/components/feedback-provider';
import { useDeleteMechanic, useMechanics } from '@/hooks/api/use-mechanics';
import type { Mechanic } from '@/lib/api/types';
import { useMechanicFilters } from './use-mechanic-filters';

export function useMechanicPage() {
  const search = useMechanicFilters();
  const { page, setPage } = search;
  const mechanics = useMechanics(search.filters);
  const recordCount = mechanics.data?.count ?? 0;
  const deletion = useDeleteMechanic();
  const { notify } = useFeedback();
  const [editing, setEditing] = useState<Mechanic | null | undefined>(undefined);
  const [viewing, setViewing] = useState<Mechanic | null>(null);
  const [deleting, setDeleting] = useState<Mechanic | null>(null);

  function requestDelete(mechanic: Mechanic) {
    deletion.reset();
    setDeleting(mechanic);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deletion.mutateAsync(deleting.id);
      setDeleting(null);
      notify('Mechanic deleted.');
      if (mechanics.data?.results?.length === 1 && page > 1) setPage(page - 1);
    } catch {
      // The confirmation dialog displays the mutation error and stays open.
    }
  }

  function onSaved() {
    notify(editing ? 'Mechanic updated.' : 'Mechanic created.');
    if (search.hasFilters) setPage(1);
    else if (!editing) setPage(Math.max(1, Math.ceil((recordCount + 1) / 10)));
    setEditing(undefined);
  }

  return {
    search,
    page,
    setPage,
    mechanics,
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
