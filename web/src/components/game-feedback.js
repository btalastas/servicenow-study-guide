'use client';

import { Alert, Typography } from '@mui/material';
import { answerText } from '../lib/game-rules';

export default function GameFeedback({ question, response, correct }) {
  return (
    <Alert
      role="status"
      aria-label="Answer feedback"
      severity={correct ? 'success' : 'error'}
      sx={{ mt: 2 }}
    >
      <Typography fontWeight="bold">
        {correct ? 'Correct' : 'Incorrect'}
      </Typography>
      <Typography>Your answer: {answerText(question, response)}</Typography>
      <Typography>
        Correct answer: {answerText(question, question.correctChoiceIds)}
      </Typography>
      <Typography>{question.explanation}</Typography>
    </Alert>
  );
}
