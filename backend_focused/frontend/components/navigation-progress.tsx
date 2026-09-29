'use client';

import { useMediaQuery, useTheme } from '@mui/material';
import NextTopLoader from 'nextjs-toploader';

export function NavigationProgress() {
  const theme = useTheme();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });

  return (
    <NextTopLoader
      color={theme.palette.primary.main}
      height={3}
      showSpinner={false}
      shadow={false}
      showForHashAnchor={false}
      crawl={!reducedMotion}
      speed={reducedMotion ? 0 : 200}
      template='<div class="bar" role="bar" aria-hidden="true"></div>'
    />
  );
}
