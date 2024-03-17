import request from 'graphql-request';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from '@tanstack/react-query';

import Books, { allBooksQueryDocument } from './books';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';

export default async function BooksPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['books'],
    queryFn: async () =>
      request({
        url: API_URL,
        document: allBooksQueryDocument,
        requestHeaders: {
          'x-api-key': API_KEY
        }
      })
  });

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
          Books
        </Typography>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Books />
        </HydrationBoundary>
      </Box>
    </Container>
  );
}
