import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function Loading() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Insights skeleton */}
      <Skeleton variant="rounded" height={80} sx={{ mb: 2, borderRadius: 3 }} />
      {/* Session cards */}
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
        ))}
      </Stack>
    </Container>
  );
}
