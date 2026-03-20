import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

export default function Loading() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Skeleton variant="text" width={120} height={36} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width={240} height={20} sx={{ mb: 1.5 }} />
      {/* Level tabs */}
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: 2 }} />
      </Box>
      {/* Category chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" width={70} height={32} sx={{ borderRadius: 4 }} />
        ))}
      </Stack>
      {/* Video cards */}
      <Stack spacing={1.5}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    </Container>
  );
}
