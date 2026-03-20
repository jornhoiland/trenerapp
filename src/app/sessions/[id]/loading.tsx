import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function Loading() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
      <Stack spacing={1.5}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    </Container>
  );
}
