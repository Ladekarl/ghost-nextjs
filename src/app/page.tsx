import NextLink from 'next/link';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Ghost Project
        </Typography>
        <Link href="/books" component={NextLink}>
          Go to the books
        </Link>
        <Link href="/chat" component={NextLink}>
          Go to the chat
        </Link>
      </Box>
    </Container>
  );
}
