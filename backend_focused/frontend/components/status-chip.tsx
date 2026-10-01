'use client';

import { Chip } from '@mui/material';

export function StatusChip({ active }: { active: boolean }) {
  return (
    <Chip
      label={active ? 'Active' : 'Inactive'}
      size="small"
      color={active ? 'success' : 'default'}
      variant="outlined"
    />
  );
}
