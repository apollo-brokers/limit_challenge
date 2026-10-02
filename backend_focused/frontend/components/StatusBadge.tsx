'use client';

import { Chip, ChipProps } from '@mui/material';

type Props = {
  active: boolean;
  size?: ChipProps['size'];
};

export default function StatusBadge({ active, size = 'small' }: Props) {
  return (
    <Chip
      size={size}
      label={active ? 'Active' : 'Inactive'}
      aria-label={active ? 'Status: Active' : 'Status: Inactive'}
      sx={
        active
          ? {
              bgcolor: 'success.light',
              color: 'success.dark',
              border: '1px solid',
              borderColor: '#86EFAC',
              '& .MuiChip-label': { px: 1 },
            }
          : {
              bgcolor: '#F1F5F9',
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiChip-label': { px: 1 },
            }
      }
    />
  );
}
