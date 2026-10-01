'use client';

import { useState } from 'react';
import { useFeedback } from '@/components/feedback-provider';
import { useDeleteOffice, useOffices } from '@/hooks/api/use-offices';
import type { Office } from '@/lib/api/types';
import { useOfficeFilters } from './use-office-filters';

export function useOfficePage() {
  const search = useOfficeFilters();
  const { page, setPage } = search;
  const offices = useOffices(search.filters);
  const recordCount = offices.data?.count ?? 0;
  const deletion = useDeleteOffice();
  const { notify } = useFeedback();
  const [editing, setEditing] = useState<Office | null | undefined>(undefined);
  const [viewing, setViewing] = useState<Office | null>(null);
  const [deleting, setDeleting] = useState<Office | null>(null);

  function requestDelete(office: Office) {
    deletion.reset();
    setDeleting(office);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deletion.mutateAsync(deleting.id);
      setDeleting(null);
      notify('Office deleted.');
      if (offices.data?.results?.length === 1 && page > 1) setPage(page - 1);
    } catch {
      // The confirmation dialog displays the mutation error and stays open.
    }
  }

  function onSaved() {
    notify(editing ? 'Office updated.' : 'Office created.');
    if (search.hasFilters) setPage(1);
    else if (!editing) setPage(Math.max(1, Math.ceil((recordCount + 1) / 10)));
    setEditing(undefined);
  }

  return {
    search,
    page,
    setPage,
    offices,
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
