'use client';

import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { authClient } from '@/lib/api-client';
import { getErrorStatus, parseApiError } from '@/lib/api-errors';
import { safeNextPath, setTokens, useHasSession } from '@/lib/auth';
import type { TokenPair } from '@/lib/types';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));
  const expired = searchParams.get('reason') === 'expired';
  const hasSession = useHasSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = useMutation({
    mutationFn: async () =>
      (await authClient.post<TokenPair>('/v1/auth/token/', { username, password })).data,
    onSuccess: (tokens) => {
      setTokens(tokens);
      router.replace(next);
    },
  });

  useEffect(() => {
    if (hasSession) router.replace(next);
  }, [hasSession, next, router]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate();
  }

  const errorMessage = login.isError
    ? getErrorStatus(login.error) === 401
      ? 'Invalid username or password.'
      : parseApiError(login.error).message
    : null;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <Paper variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" component="h1">
              Fleet Maintenance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in with your API user.
            </Typography>
          </Box>
          {expired && !errorMessage && (
            <Alert severity="info">Your session expired. Please sign in again.</Alert>
          )}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" variant="contained" size="large" loading={login.isPending}>
            Sign in
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
