'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import {
  createJeopardyBoard,
  createMillionaireQuestions,
  jeopardyModules,
  millionairePools,
} from '../lib/game-rules';
import LocalBankImport from './local-bank-import';
import JeopardyGame from './jeopardy-game';
import MillionaireGame from './millionaire-game';

export default function LocalGameSession({ certificate, mode }) {
  const [bank, setBank] = useState([]);
  const [round, setRound] = useState(null);
  const [error, setError] = useState('');
  const isJeopardy = mode === 'jeopardy';
  const eligibleModules = jeopardyModules(bank);
  const pools = millionairePools(bank);
  const enough = isJeopardy
    ? eligibleModules.length >= 5
    : Object.values(pools).every((questions) => questions.length >= 5);

  useEffect(() => {
    if (!round) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [round]);

  function start() {
    try {
      setError('');
      setRound(
        isJeopardy
          ? { columns: createJeopardyBoard(bank) }
          : { questions: createMillionaireQuestions(bank) },
      );
    } catch (err) {
      setError(err.message);
    }
  }

  if (round)
    return isJeopardy ? (
      <JeopardyGame columns={round.columns} onRestart={() => setRound(null)} />
    ) : (
      <MillionaireGame
        questions={round.questions}
        onRestart={() => setRound(null)}
      />
    );

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <Alert severity="info">
        All modules in the imported bank are included in the selection pool.
        Difficulty progresses automatically in this game; quizzes and exams have
        no difficulty filter.
      </Alert>
      <LocalBankImport
        certificate={certificate}
        onBankChange={(questions) => {
          setBank(questions);
          setError('');
        }}
      />
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography component="h2" variant="h5" gutterBottom>
          How to play
        </Typography>
        {isJeopardy ? (
          <>
            <Typography>
              Five randomly selected modules form the columns. Each column has
              five unique questions: $100 and $200 easy, $300 and $400 medium,
              and $500 hard.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Choose any clue. A correct answer adds its value; an incorrect
              answer or skipped clue subtracts it. Play all 25 clues or end
              early to review your results. The counter can go below zero.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              At least five modules must each contain two easy, two medium, and
              one hard question. All supported question types can appear.
            </Typography>
            {bank.length > 0 && (
              <Alert severity={enough ? 'success' : 'warning'} sx={{ mt: 2 }}>
                {eligibleModules.length} modules qualify.{' '}
                {enough
                  ? 'Five will be chosen at random.'
                  : 'Add questions until at least five modules meet the difficulty requirements.'}
              </Alert>
            )}
          </>
        ) : (
          <>
            <Typography>
              Answer 15 choice-based questions to climb from $10 to $1,000,000.
              Questions 1–5 are easy, 6–10 medium, and 11–15 hard.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Five correct answers secure $500; ten secure $25,000. One
              incorrect answer ends the game with your guaranteed prize. Walk
              away before answering to keep your current winnings.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              All modules are pooled. Single-answer, multiple-answer,
              true/false, and choice-based scenarios are supported; ordering
              questions are excluded. Multiple-answer questions require the
              exact set, with no partial credit.
            </Typography>
            {bank.length > 0 && (
              <Alert severity={enough ? 'success' : 'warning'} sx={{ mt: 2 }}>
                Choice questions available:{' '}
                {Object.entries(pools)
                  .map(([tier, questions]) => `${tier}: ${questions.length}`)
                  .join(', ')}
                .{' '}
                {enough
                  ? 'Five per difficulty will be drawn without repeats.'
                  : 'Each difficulty needs at least five choice-based questions.'}
              </Alert>
            )}
          </>
        )}
      </Paper>
      {error && <Alert severity="error">{error}</Alert>}
      <Box>
        <Button
          variant="contained"
          disabled={!bank.length || !enough}
          onClick={start}
        >
          Start {isJeopardy ? 'Jeopardy' : 'Millionaire'}
        </Button>
      </Box>
    </Stack>
  );
}
