'use client';

import { Resolver, useForm } from 'react-hook-form';

import { Alert, Box, Button, TextField } from '@mui/material';

export type PromptFormValues = {
  prompt: string;
};

type PromptFormProps = {
  onSubmit: (data: PromptFormValues) => void;
  error?: string;
  disabled?: boolean;
};

const resolver: Resolver<PromptFormValues> = async values => {
  return {
    values: values.prompt ? values : {},
    errors: !values.prompt
      ? {
          prompt: {
            type: 'required',
            message: 'This is required.'
          }
        }
      : {}
  };
};

export default function PromptForm({
  onSubmit,
  error,
  disabled
}: PromptFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PromptFormValues>({
    resolver
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1
        }}
      >
        <TextField
          {...register('prompt')}
          placeholder="Write your prompt here..."
          error={!!errors.prompt}
          helperText={errors.prompt?.message}
        />
        <Button type="submit" disabled={disabled}>
          Submit
        </Button>
        {!!error && <Alert severity="error">{error}</Alert>}
      </Box>
    </form>
  );
}
