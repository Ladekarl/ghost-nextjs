'use client';

import AccountBoxRoundedIcon from '@mui/icons-material/AccountBoxRounded';
import AssistantRoundedIcon from '@mui/icons-material/AssistantRounded';
import { Stack, SvgIcon, Typography } from '@mui/material';

type ChatMessageProps = {
  message: {
    content: string;
    role: string;
  };
};

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <Stack p={2} bgcolor="grey.900" borderRadius={1} direction="row" gap={2}>
      {message.role === 'user' ? (
        <SvgIcon color="primary" component={AccountBoxRoundedIcon} />
      ) : (
        <SvgIcon color="secondary" component={AssistantRoundedIcon} />
      )}
      <Stack>
        <Typography variant="subtitle2" pb={0.5}>
          {message.role === 'user' ? 'You' : 'GhostBot'}
        </Typography>
        <Typography variant="body1">{message.content}</Typography>
      </Stack>
    </Stack>
  );
}
