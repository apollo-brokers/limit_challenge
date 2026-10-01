'use client';

import { Box, DialogTitle } from '@mui/material';
import type { ReactNode } from 'react';
import { FleetMascot } from './fleet-mascot';

export function MascotDialogTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <DialogTitle
      id={id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        borderBottom: 1,
        borderColor: 'divider',
        mb: 2,
      }}
    >
      <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        {children}
      </Box>
      <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', flexShrink: 0 }}>
        <FleetMascot size={44} />
      </Box>
    </DialogTitle>
  );
}
