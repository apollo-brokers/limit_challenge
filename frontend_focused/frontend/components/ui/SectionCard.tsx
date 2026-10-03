'use client';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}

export function SectionCard({ title, subtitle, action, children, id }: SectionCardProps) {
  return (
    <Card id={id}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
        {title ? (
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
              {subtitle ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            {action}
          </Stack>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}
