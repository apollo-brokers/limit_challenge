'use client';

import { Box, Button, type ButtonProps } from '@mui/material';
import { FleetMascot } from './fleet-mascot';

type Props = Omit<ButtonProps, 'variant' | 'color' | 'component' | 'href'>;

const revealed = { opacity: 1, transform: 'translate(-50%, -24px) rotate(-5deg)' };

/** A normal primary action with a decorative peek; no extra focus or click targets. */
export function MascotButton({
  children,
  disabled,
  loading,
  fullWidth,
  sx = [],
  type = 'button',
  ...props
}: Props) {
  const interactive = !disabled && !loading;

  return (
    <Box
      component="span"
      data-testid="mascot-button"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        isolation: 'isolate',
        verticalAlign: 'middle',
        width: fullWidth ? '100%' : undefined,
        ...(interactive && {
          '& > .MuiButton-root.Mui-focusVisible ~ [data-mascot-peek]': revealed,
          '@media (hover: hover) and (pointer: fine)': {
            '&:hover > [data-mascot-peek]': revealed,
          },
        }),
      }}
    >
      <Button
        {...props}
        type={type}
        variant="contained"
        color="primary"
        disabled={disabled}
        loading={loading}
        fullWidth={fullWidth}
        sx={[{ position: 'relative', zIndex: 1, flexGrow: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {children}
      </Button>
      <Box
        component="span"
        aria-hidden="true"
        data-mascot-peek
        data-testid="mascot-peek"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          display: 'inline-flex',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0,
          transform: 'translate(-50%, 12px) rotate(5deg)',
          transition: (theme) =>
            theme.transitions.create(['transform', 'opacity'], {
              duration: 200,
              easing: theme.transitions.easing.easeOut,
            }),
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        <FleetMascot size={60} />
      </Box>
    </Box>
  );
}
