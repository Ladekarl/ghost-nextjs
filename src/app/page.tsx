import NextLink from 'next/link';

import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box
        gap={2}
        my={4}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Link href="/ingest" component={NextLink}>
          <Button variant="outlined">Upload knowledge to the database</Button>
        </Link>
        <Link href="/chat" component={NextLink}>
          <Button variant="outlined">Try out the chat</Button>
        </Link>
      </Box>
    </Container>
  );
}
