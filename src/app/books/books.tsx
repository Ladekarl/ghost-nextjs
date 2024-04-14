'use client';

import request from 'graphql-request';

import { graphql } from '@/gql';
import { Box, Card, Grid, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';

export const allBooksQueryDocument = graphql(/* GraphQL */ `
  query allBooksQuery {
    books {
      author
      title
    }
  }
`);

export default function Books() {
  const { data } = useQuery({
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
    <Box
      sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Grid>
        {data?.books?.map(book => (
          <Card key={book?.title} sx={{ m: 5, p: 5 }}>
            <Typography variant="body1" component="h1">
              Title: {book?.title}
            </Typography>
            <Typography variant="body2" component="h1">
              Author: {book?.author}
            </Typography>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
