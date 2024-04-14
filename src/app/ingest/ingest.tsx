'use client';

import IngestForm, { PromptFormValues } from '@/app/ingest/IngestForm';
import { request } from '@/utils/network';
import { Box, CircularProgress } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

export async function postText(text: PromptFormValues) {
  const result = await request<string, PromptFormValues>({
    url: '/api/v1/ingest',
    method: 'POST',
    data: text
  });
  return result;
}

export default function Ingest() {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (text: PromptFormValues) => {
      return postText(text);
    }
  });

  if (isPending) {
    return (
      <Box py={10} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <IngestForm onSubmit={mutate} error={error?.message} disabled={isPending} />
  );
}
