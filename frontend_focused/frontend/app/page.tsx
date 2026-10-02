'use client';

import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(160deg, rgba(37, 99, 235, 0.12) 0%, #f4f6fb 45%, #ffffff 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={0}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
              <Typography variant="h3" component="h1" fontWeight={700}>
                Submission Tracker
              </Typography>
              <Typography color="text.secondary">
                A focused workspace for operations teams to review broker submissions, apply
                filters, and inspect opportunity details in one place.
              </Typography>
              <Box>
                <Button variant="contained" size="large" onClick={() => router.push('/submissions')}>
                  Open submissions workspace
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
