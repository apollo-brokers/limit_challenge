'use client';

import { Box, FormControl, InputLabel, MenuItem, Select, Tab, Tabs } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { getNavigationSection, navigationSections } from './navigation-items';

export function MainNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const selected = getNavigationSection(pathname)?.href;

  return (
    <Box component="nav" aria-label="Sections">
      <Tabs
        value={selected ?? false}
        aria-label="Main navigation"
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        {navigationSections.map(({ href, label }) => (
          <Tab
            key={href}
            component={NextLink}
            href={href}
            value={href}
            label={label}
            aria-current={selected === href ? 'location' : undefined}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>
      <FormControl fullWidth size="small" sx={{ display: { xs: 'flex', sm: 'none' }, my: 2 }}>
        <InputLabel id="section-navigation-label">Section</InputLabel>
        <Select
          labelId="section-navigation-label"
          id="section-navigation"
          label="Section"
          value={selected ?? ''}
          onChange={(event) => {
            const destination = navigationSections.find(({ href }) => href === event.target.value);
            if (destination) router.push(destination.href);
          }}
        >
          {navigationSections.map(({ href, label }) => (
            <MenuItem key={href} value={href}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
