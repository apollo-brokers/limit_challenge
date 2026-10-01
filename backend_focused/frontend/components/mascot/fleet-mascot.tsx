'use client';

import { Box, type SxProps, type Theme } from '@mui/material';
import Image from 'next/image';

type Props = {
  size?: number;
  sx?: SxProps<Theme>;
};

/** Decorative only: never changes a control's accessible name. */
export function FleetMascot({ size = 48, sx = [] }: Props) {
  return (
    <Box
      component="span"
      aria-hidden="true"
      data-testid="fleet-mascot"
      sx={[
        {
          display: 'inline-flex',
          width: size,
          height: size,
          flexShrink: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Image
        src="/mascot/piston.webp"
        alt=""
        width={size}
        height={size}
        draggable={false}
        unoptimized
      />
    </Box>
  );
}
