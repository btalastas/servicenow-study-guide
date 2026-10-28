'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { isCorrect } from '../lib/practice';
import { JEOPARDY_ROWS, money } from '../lib/game-rules';
import GameAnswer from './game-answer';
import GameFeedback from './game-feedback';
import GameResults from './game-results';

export default function JeopardyGame({ columns, onRestart }) {
  const [active, setActive] = useState(null);
  const [response, setResponse] = useState([]);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const resultHeading = useRef(null);
  const clues = columns.flatMap((column) => column.clues);
  const played = clues.filter((clue) =>
    Object.hasOwn(answers, clue.question.questionId),
  );
  const score = played.reduce(
    (sum, clue) =>
      sum +
      (isCorrect(clue.question, answers[clue.question.questionId])
        ? clue.amount
        : -clue.amount),
    0,
  );
  const revealed = active && Object.hasOwn(answers, active.question.questionId);

  useEffect(() => {
    if (finished) resultHeading.current?.focus();
  }, [finished]);

  function submit(ids) {
    if (!active || revealed) return;
    setResponse(ids);
    setAnswers((old) => ({ ...old, [active.question.questionId]: ids }));
  }

  function closeClue() {
    if (!revealed) return;
    setActive(null);
    setResponse([]);
    if (played.length === 25) setFinished(true);
  }

  if (finished)
    return (
      <Box ref={resultHeading} tabIndex={-1}>
        <GameResults
          title="Jeopardy"
          earnings={score}
          questions={played.map((clue) => clue.question)}
          responses={answers}
          onRestart={onRestart}
        >
          <Typography>{played.length} of 25 clues played.</Typography>
        </GameResults>
      </Box>
    );

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Typography role="status" aria-label="Jeopardy earnings" variant="h4">
          {money(score)}
        </Typography>
        <Typography>{played.length}/25 clues played</Typography>
      </Stack>
      <Typography variant="body2">
        Correct answers add the clue value; incorrect answers and skipped clues
        subtract it. On smaller screens, scroll the board sideways.
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        role="region"
        aria-label="Jeopardy board"
        tabIndex={0}
        sx={{ maxWidth: '100%', overflowX: 'auto' }}
      >
        <Table
          aria-label="Jeopardy clues"
          sx={{ minWidth: 650, tableLayout: 'fixed' }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="center"
                  scope="col"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {column.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {JEOPARDY_ROWS.map((row, rowIndex) => (
              <TableRow key={row.amount}>
                {columns.map((column) => {
                  const clue = column.clues[rowIndex];
                  const done = Object.hasOwn(answers, clue.question.questionId);
                  return (
                    <TableCell key={column.id} align="center" sx={{ p: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{ minHeight: 72, fontSize: '1.25rem' }}
                        disabled={done}
                        aria-label={`${column.name}, ${money(clue.amount)}, ${clue.difficulty}${done ? ', played' : ''}`}
                        onClick={() => {
                          setActive(clue);
                          setResponse([]);
                        }}
                      >
                        {done
                          ? isCorrect(
                              clue.question,
                              answers[clue.question.questionId],
                            )
                            ? '✓'
                            : '—'
                          : money(clue.amount)}
                      </Button>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box>
        <Button variant="outlined" onClick={() => setConfirmEnd(true)}>
          End game
        </Button>
      </Box>
      <Dialog
        open={Boolean(active)}
        onClose={() => {
          if (revealed) closeClue();
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="clue-title"
      >
        {active && (
          <>
            <DialogTitle id="clue-title">
              {active.question.moduleName} · {money(active.amount)} ·{' '}
              {active.difficulty}
            </DialogTitle>
            <DialogContent sx={{ overflowWrap: 'anywhere' }}>
              <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                {active.question.prompt}
              </Typography>
              <GameAnswer
                question={active.question}
                response={response}
                onChange={setResponse}
                disabled={Boolean(revealed)}
              />
              {revealed && (
                <GameFeedback
                  question={active.question}
                  response={response}
                  correct={isCorrect(active.question, response)}
                />
              )}
            </DialogContent>
            <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
              {revealed ? (
                <Button variant="contained" onClick={closeClue}>
                  {played.length === 25 ? 'View results' : 'Back to board'}
                </Button>
              ) : (
                <>
                  <Button onClick={() => submit([])}>Skip clue</Button>
                  <Button
                    variant="contained"
                    disabled={!response.length}
                    onClick={() => submit(response)}
                  >
                    Submit answer
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      <Dialog
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        aria-labelledby="end-game-title"
      >
        <DialogTitle id="end-game-title">End this game?</DialogTitle>
        <DialogContent>
          Keep your current total of {money(score)}. The {25 - played.length}{' '}
          unplayed clues will not be scored.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEnd(false)}>Keep playing</Button>
          <Button
            onClick={() => {
              setConfirmEnd(false);
              setFinished(true);
            }}
          >
            End and view results
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
