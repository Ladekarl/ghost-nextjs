import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import * as React from 'react';

export function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <MuiLink color="inherit" href="/">
        Ghost Project
      </MuiLink>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}
