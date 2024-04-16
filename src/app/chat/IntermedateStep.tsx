'use client';

import type { Message } from 'ai/react';
import { AgentStep } from 'langchain/agents';

import ConstructionIcon from '@mui/icons-material/Construction';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';

type IntermediateStepProps = {
  message: Message;
};

export function IntermediateStep({ message }: IntermediateStepProps) {
  const { action, observation }: AgentStep = JSON.parse(message.content);

  return (
    <Stack>
      <Stack p={2} bgcolor="grey.900" borderRadius={1} direction="row" gap={2}>
        <SvgIcon color="secondary" component={ConstructionIcon} />
        <Stack>
          <Typography variant="subtitle2" pb={0.5}>
            Intermediate step
          </Typography>
          <Typography variant="body1">{action.tool}</Typography>
        </Stack>
      </Stack>
      <Accordion>
        <AccordionSummary
          expandIcon={<SvgIcon component={ExpandMoreIcon} />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <SvgIcon color="primary" component={InputIcon} />
          <Typography pl={2} variant="subtitle2" pb={0.5}>
            Tool Input
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">
            {(action.toolInput as { query: string }).query}
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<SvgIcon component={ExpandMoreIcon} />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <SvgIcon color="primary" component={OutputIcon} />
          <Typography pl={2} variant="subtitle2" pb={0.5}>
            Tool Output
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">{observation}</Typography>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
