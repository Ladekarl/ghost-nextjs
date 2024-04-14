import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Prompt from './prompt';

export default async function ChatPage() {
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
          Prompt
        </Typography>
        <Prompt />
      </Box>
    </Container>
  );
}
