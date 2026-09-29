'use client';

import { Box, Tab, Tabs } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavigationSection } from './navigation-items';

export function SectionTabs() {
  const pathname = usePathname();
  const section = getNavigationSection(pathname);
  if (!section?.views.length) return null;
  const selected = section.views.find(({ href }) => pathname === href)?.href ?? section.href;

  return (
    <Box
      component="nav"
      aria-label={`${section.label} views`}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Tabs
        value={selected}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={`${section.label} views`}
      >
        {section.views.map(({ href, label }) => (
          <Tab
            key={href}
            component={NextLink}
            href={href}
            value={href}
            label={label}
            aria-current={selected === href ? (pathname === href ? 'page' : 'location') : undefined}
            sx={{ textTransform: 'none' }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
