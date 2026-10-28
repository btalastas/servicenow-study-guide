'use client';

import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { summarize } from '../lib/practice';
import { answerText, money } from '../lib/game-rules';

export default function GameResults({
  title,
  earnings,
  questions,
  responses,
  onRestart,
  children,
}) {
  const results = summarize(questions, responses);
  return (
    <Stack spacing={3} sx={{ mt: 3, overflowWrap: 'anywhere' }}>
      <Typography component="h2" variant="h4">
        {title} results
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography component="p" variant="h3" aria-label="Final earnings">
          {money(earnings)}
        </Typography>
        {children}
        <Typography sx={{ mt: 2 }}>
          {results.correct} correct out of {results.total} played questions (
          {results.percent}%).
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Unplayed questions are not scored. Skipped clues count as incorrect.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography component="h3" variant="h5" gutterBottom>
          Areas to focus on
        </Typography>
        {!results.total && <Typography>No questions played yet.</Typography>}
        {results.total > 0 && !results.missed.length && (
          <Typography>No missed questions in this game.</Typography>
        )}
        {results.modules.map((group) => (
          <Typography key={group.id}>
            {group.name}: {group.correct}/{group.total} correct ({group.percent}
            %){group.correct < group.total ? ' — review recommended' : ''}
          </Typography>
        ))}
      </Paper>
      <Typography component="h3" variant="h5">
        Missed questions ({results.missed.length})
      </Typography>
      {results.missed.map((question) => (
        <Paper variant="outlined" key={question.questionId} sx={{ p: 3 }}>
          <Typography color="text.secondary" variant="body2">
            {question.moduleName} · {question.difficulty}
          </Typography>
          <Typography component="h4" variant="h6" sx={{ my: 1 }}>
            {question.prompt}
          </Typography>
          <Typography>
            Your answer: {answerText(question, responses[question.questionId])}
          </Typography>
          <Typography>
            Correct answer: {answerText(question, question.correctChoiceIds)}
          </Typography>
          <Typography sx={{ mt: 1 }}>{question.explanation}</Typography>
        </Paper>
      ))}
      <Box>
        <Button variant="contained" onClick={onRestart}>
          Set up another game
        </Button>
      </Box>
    </Stack>
  );
}
