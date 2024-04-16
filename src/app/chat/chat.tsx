'use client';

import { Message, useChat } from 'ai/react';
import { AgentStep } from 'langchain/agents';
import { ChangeEvent, type FormEvent, useState } from 'react';

import { request } from '@/utils/network';
import {
  Alert,
  Button,
  Container,
  Fade,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';

import { ChatMessage } from './ChatMessage';
import { IntermediateStep } from './IntermedateStep';

type IntermediateStepsReponse = {
  output: string;
  intermediate_steps: any;
};

type IntermediateStepsParams = {
  messagesWithUserReply: Message[];
};

export default function Chat() {
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
    setMessages
  } = useChat({
    api: 'api/v1/chats',
    onError: error => {
      const jsonError: { error: string } = JSON.parse(error.message);
      setSnackbarMessage(jsonError.error);
      setSnackbarOpen(true);
    }
  });

  const {
    isPending: intermediateStepsLoading,
    mutateAsync: mutateIntermediateSteps
  } = useMutation<IntermediateStepsReponse, Error, IntermediateStepsParams>({
    mutationKey: ['chats'],
    mutationFn: ({ messagesWithUserReply }) =>
      request({
        url: 'api/v1/chats',
        method: 'POST',
        data: {
          messages: messagesWithUserReply,
          show_intermediate_steps: showIntermediateSteps
        }
      }),
    onError: error => {
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
    }
  });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!messages.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading) {
      return;
    }
    if (!showIntermediateSteps) {
      handleSubmit(e);
    } else {
      const messagesWithUserReply = messages.concat({
        id: messages.length.toString(),
        content: input,
        role: 'user'
      });
      setMessages(messagesWithUserReply);
      const response = await mutateIntermediateSteps({ messagesWithUserReply });
      const intermediateStepMessages = (response.intermediate_steps ?? []).map(
        (intermediateStep: AgentStep, i: number) => {
          return {
            id: (messagesWithUserReply.length + i).toString(),
            content: JSON.stringify(intermediateStep),
            role: 'system'
          };
        }
      );
      const newMessages = messagesWithUserReply;
      for (const message of intermediateStepMessages) {
        newMessages.push(message);
        setMessages([...newMessages]);
      }
      setMessages([
        ...newMessages,
        {
          id: (newMessages.length + intermediateStepMessages.length).toString(),
          content: response.output,
          role: 'assistant'
        }
      ]);
    }
  }

  function onChangeIntermediateSteps(
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) {
    setShowIntermediateSteps(checked);
  }

  function onSnackbarClose() {
    setSnackbarOpen(false);
  }

  return (
    <Container>
      <Stack
        mt={10}
        mb={4}
        mx={10}
        direction="column"
        useFlexGap
        flexWrap="wrap"
        gap={4}
      >
        {messages.length > 0 &&
          [...messages].map(m =>
            m.role === 'system' ? (
              <IntermediateStep key={m.id} message={m} />
            ) : (
              <ChatMessage key={m.id} message={m} />
            )
          )}
      </Stack>
      <Container disableGutters={true}>
        <form onSubmit={sendMessage}>
          <Stack direction="row" gap={1}>
            <TextField
              fullWidth
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question..."
            />
            <Button
              disabled={chatEndpointIsLoading || intermediateStepsLoading}
              type="submit"
            >
              Send
            </Button>
          </Stack>
        </form>
        <Stack
          alignSelf="flex-end"
          borderColor="primary"
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          pt={2}
          pr={1}
        >
          <Typography variant="body2" p={1}>
            Show intermediate steps
          </Typography>
          <Switch
            onChange={onChangeIntermediateSteps}
            checked={showIntermediateSteps}
          />
        </Stack>
      </Container>
      <Snackbar
        color=""
        TransitionComponent={Fade}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={onSnackbarClose}
      >
        <Alert onClose={onSnackbarClose} severity="error" variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
