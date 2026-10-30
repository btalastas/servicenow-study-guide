'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { isCorrect } from '../lib/practice';
import { guaranteedPrize, MILLIONAIRE_LADDER, money } from '../lib/game-rules';
import GameAnswer from './game-answer';
import GameFeedback from './game-feedback';
import GameResults from './game-results';

export default function MillionaireGame({ questions, onRestart }) {
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState([]);
  const [answers, setAnswers] = useState({});
  const [ended, setEnded] = useState(null);
  const [confirmWalk, setConfirmWalk] = useState(false);
  const heading = useRef(null);
  const question = questions[index];
  const level = MILLIONAIRE_LADDER[index];
  const submitted = Object.hasOwn(answers, question.questionId);
  const correct =
    submitted && isCorrect(question, answers[question.questionId]);
  const played = questions.filter((q) => Object.hasOwn(answers, q.questionId));
  const correctCount = played.filter((q) =>
    isCorrect(q, answers[q.questionId]),
  ).length;
  const earned = MILLIONAIRE_LADDER[correctCount - 1]?.amount ?? 0;
  const guaranteed = guaranteedPrize(correctCount);
  const lost = submitted && !correct;

  useEffect(() => {
    heading.current?.focus();
  }, [index, ended]);

  function submit() {
    if (submitted || !response.length) return;
    setAnswers((old) => ({ ...old, [question.questionId]: response }));
  }

  function next() {
    if (!submitted) return;
    if (!correct) setEnded('lost');
    else if (index === questions.length - 1) setEnded('won');
    else {
      setIndex((old) => old + 1);
      setResponse([]);
    }
  }

  if (ended)
    return (
      <Box ref={heading} tabIndex={-1}>
        <GameResults
          title="Millionaire"
          earnings={ended === 'lost' ? guaranteed : earned}
          questions={played}
          responses={answers}
          onRestart={onRestart}
        >
          <Typography>
            {ended === 'won'
              ? 'You reached $1,000,000!'
              : ended === 'lost'
                ? `Game over. You keep your guaranteed prize of ${money(guaranteed)}.`
                : `You walked away with ${money(earned)}.`}
          </Typography>
        </GameResults>
      </Box>
    );

  return (
    <Stack spacing={3} sx={{ mt: 3, overflowWrap: 'anywhere' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Typography
          role="status"
          aria-label="Millionaire earnings"
          variant="h4"
        >
          {money(lost ? guaranteed : earned)}
        </Typography>
        <Typography>Guaranteed: {money(guaranteed)}</Typography>
      </Stack>
      <Typography>
        Question {index + 1} of 15 · {level.difficulty} · for{' '}
        {money(level.amount)}
      </Typography>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="flex-start"
      >
        <Paper
          variant="outlined"
          sx={{ p: 3, flex: 1, minWidth: 0, width: '100%' }}
        >
          <Typography color="text.secondary" variant="body2">
            {question.moduleName}
          </Typography>
          <Typography
            ref={heading}
            tabIndex={-1}
            component="h2"
            variant="h5"
            sx={{ my: 2 }}
          >
            {question.prompt}
          </Typography>
          <GameAnswer
            question={question}
            response={response}
            onChange={setResponse}
            disabled={submitted}
          />
          {submitted && (
            <GameFeedback
              question={question}
              response={response}
              correct={correct}
            />
          )}
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ mt: 3, flexWrap: 'wrap' }}
          >
            {!submitted ? (
              <>
                <Button
                  variant="contained"
                  disabled={!response.length}
                  onClick={submit}
                >
                  Final answer
                </Button>
                <Button onClick={() => setConfirmWalk(true)}>Walk away</Button>
              </>
            ) : (
              <Button variant="contained" onClick={next}>
                {lost || index === 14 ? 'View results' : 'Next question'}
              </Button>
            )}
          </Stack>
        </Paper>
        <Paper
          component="aside"
          variant="outlined"
          sx={{ p: 2, width: { xs: '100%', md: 220 }, flexShrink: 0 }}
        >
          <Typography component="h2" variant="h6" gutterBottom>
            Prize ladder
          </Typography>
          <Box
            component="ol"
            aria-label="Prize ladder"
            sx={{ listStyle: 'none', m: 0, p: 0 }}
          >
            {MILLIONAIRE_LADDER.map((step, i) => (
              <Box
                component="li"
                key={step.amount}
                aria-current={i === index ? 'step' : undefined}
                sx={{
                  p: 0.75,
                  borderRadius: 1,
                  bgcolor: i === index ? 'primary.main' : 'transparent',
                  color: i === index ? 'primary.contrastText' : 'text.primary',
                  fontWeight: step.checkpoint ? 'bold' : 'normal',
                }}
              >
                {i + 1}. {money(step.amount)}{' '}
                {step.checkpoint && <Chip size="small" label="Safe" />}
              </Box>
            )).reverse()}
          </Box>
        </Paper>
      </Stack>
      <Dialog
        open={confirmWalk}
        onClose={() => setConfirmWalk(false)}
        aria-labelledby="walk-title"
      >
        <DialogTitle id="walk-title">
          Walk away with {money(earned)}?
        </DialogTitle>
        <DialogContent>
          Your current question will not be scored. You can review your played
          questions after leaving.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmWalk(false)}>Keep playing</Button>
          <Button
            onClick={() => {
              setConfirmWalk(false);
              setEnded('walked');
            }}
          >
            Take prize and finish
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
