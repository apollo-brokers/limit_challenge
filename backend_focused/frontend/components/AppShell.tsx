'use client';

import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { PropsWithChildren, ReactNode, useState } from 'react';

const DRAWER_WIDTH = 248;

type NavItem = {
  id: 'search' | 'due';
  label: string;
  description: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: 'search',
    label: 'Vehicle search',
    description: 'Filter & manage fleet',
    icon: <SearchOutlinedIcon fontSize="small" />,
  },
  {
    id: 'due',
    label: 'Needs maintenance',
    description: 'Overdue & never serviced',
    icon: <BuildCircleOutlinedIcon fontSize="small" />,
  },
];

type Props = PropsWithChildren<{
  activeTab: 'search' | 'due';
  onNavigate: (tab: 'search' | 'due') => void;
  resultCount?: number;
}>;

export default function AppShell({ activeTab, onNavigate, resultCount, children }: Props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2.75, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'grid',
              placeItems: 'center',
            }}
            aria-hidden
          >
            <DirectionsCarFilledOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 700 }}
            >
              Fleetline
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
              Fleet operations
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 1.5, py: 2, flex: 1 }}>
        <Typography variant="overline" sx={{ px: 1.5, mb: 1, display: 'block' }}>
          Workspace
        </Typography>
        <List disablePadding>
          {NAV_ITEMS.map((item) => {
            const selected = activeTab === item.id;
            return (
              <ListItemButton
                key={item.id}
                selected={selected}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  py: 1.1,
                  px: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(15, 118, 110, 0.1)',
                    '&:hover': { bgcolor: 'rgba(15, 118, 110, 0.14)' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 36, color: selected ? 'primary.main' : 'text.secondary' }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: selected ? 700 : 600,
                    color: selected ? 'primary.dark' : 'text.primary',
                  }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption">
          {typeof resultCount === 'number'
            ? `${resultCount.toLocaleString()} vehicles in view`
            : 'Connected to local API'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          display: { md: 'none' },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} letterSpacing="-0.02em">
            Fleetline
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isDesktop ? (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider',
                bgcolor: '#FFFFFF',
              },
            }}
          >
            {nav}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {nav}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          pt: { xs: 8, md: 0 },
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
