'use client';

import PromptForm, { PromptFormValues } from '@/components/PromptForm';
import { request } from '@/utils/network';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

export async function postPrompt(prompt: PromptFormValues) {
  const result = await request<string, PromptFormValues>({
    url: '/api/v1/prompts',
    method: 'POST',
    data: prompt
  });
  return result;
}

export default function Prompt() {
  const { mutate, data, isPending, error } = useMutation({
    mutationFn: (prompt: PromptFormValues) => {
      return postPrompt(prompt);
    }
  });

  return (
    <Box>
      <PromptForm
        onSubmit={mutate}
        error={error?.message}
        disabled={isPending}
      />
      {isPending ? <CircularProgress /> : <Typography>{data}</Typography>}
    </Box>
  );
}
