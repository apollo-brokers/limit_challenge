'use client';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: (theme) =>
          `radial-gradient(900px 420px at 0% 0%, ${alpha(theme.palette.primary.main, 0.14)}, transparent 55%),
           radial-gradient(700px 380px at 100% 10%, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 50%),
           ${theme.palette.background.default}`,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 8, md: 12 },
        }}
      >
        <Stack spacing={3.5} maxWidth={560}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              aria-hidden
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'grid',
                placeItems: 'center',
                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.28)}`,
              }}
            >
              <AssignmentOutlinedIcon />
            </Box>
            <Box>
              <Typography
                variant="h4"
                component="p"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, lineHeight: 1.15 }}
              >
                Submission Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Operations workspace
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontSize: { xs: '1.85rem', sm: '2.35rem' },
                maxWidth: 520,
              }}
            >
              Review broker submissions with clarity
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 1.5, fontSize: '1.05rem', maxWidth: 460, lineHeight: 1.6 }}
            >
              Filter opportunities, scan ownership and notes, and open a full record for contacts
              and documents — all in one place.
            </Typography>
          </Box>

          <Box>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push('/submissions')}
            >
              Open submissions workspace
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
