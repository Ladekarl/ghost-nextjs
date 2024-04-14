'use client';

import { Resolver, useForm } from 'react-hook-form';

import { Alert, Box, Button, TextField } from '@mui/material';

export type PromptFormValues = {
  text: string;
};

type PromptFormProps = {
  onSubmit: (data: PromptFormValues) => void;
  error?: string;
  disabled?: boolean;
};

const resolver: Resolver<PromptFormValues> = async values => {
  return {
    values: values.text ? values : {},
    errors: !values.text
      ? {
          text: {
            type: 'required',
            message: 'This is required.'
          }
        }
      : {}
  };
};

export default function IngestForm({
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
      <Box my={4} display="flex" gap={1} flexDirection="column">
        <TextField
          multiline
          fullWidth
          {...register('text')}
          placeholder="Write your data here..."
          error={!!errors.text}
          helperText={errors.text?.message}
        />
        <Button type="submit" variant="contained" disabled={disabled}>
          Submit
        </Button>
        {!!error && <Alert severity="error">{error}</Alert>}
      </Box>
    </form>
  );
}
