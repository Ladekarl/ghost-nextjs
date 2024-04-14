'use client';

import { useChat } from 'ai/react';
import type { FormEvent } from 'react';

import AccountBoxRoundedIcon from '@mui/icons-material/AccountBoxRounded';
import AssistantRoundedIcon from '@mui/icons-material/AssistantRounded';
import {
  Button,
  Container,
  Stack,
  SvgIcon,
  TextField,
  Typography
} from '@mui/material';

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading
  } = useChat({
    api: 'api/v1/chats'
  });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!messages.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading) {
      return;
    }
    handleSubmit(e);
  }

  return (
    <Container>
      <Stack
        mt={10}
        mb={4}
        mx={10}
        alignItems="stretch"
        direction="column"
        useFlexGap
        flexWrap="wrap"
        gap={4}
      >
        {messages.length > 0 &&
          [...messages].map(m => {
            return (
              <Stack
                key={m.id}
                p={2}
                bgcolor="grey.900"
                borderRadius={1}
                direction="row"
                gap={2}
              >
                {m.role === 'user' ? (
                  <SvgIcon color="primary" component={AccountBoxRoundedIcon} />
                ) : (
                  <SvgIcon color="secondary" component={AssistantRoundedIcon} />
                )}
                <Stack>
                  <Typography variant="subtitle2" pb={0.5}>
                    {m.role === 'user' ? 'You' : 'GhostBot'}
                  </Typography>
                  <Typography variant="body1">{m.content}</Typography>
                </Stack>
              </Stack>
            );
          })}
      </Stack>
      <form onSubmit={sendMessage}>
        <Stack direction="row" gap={1} borderColor="primary">
          <TextField
            fullWidth
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question..."
          />
          <Button type="submit">Send</Button>
        </Stack>
      </form>
    </Container>
  );
}
