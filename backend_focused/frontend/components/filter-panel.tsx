'use client';

import { Button, Paper, Stack, Typography } from '@mui/material';
import { FormEventHandler, ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClear: () => void;
};

export function FilterPanel({ title, description, children, onSubmit, onClear }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Stack component="form" noValidate aria-label={title} spacing={2} onSubmit={onSubmit}>
        <Stack spacing={0.5}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Stack>
        {children}
        <Stack direction="row" spacing={1}>
          <Button variant="contained" type="submit">
            Apply filters
          </Button>
          <Button onClick={onClear}>Clear filters</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
