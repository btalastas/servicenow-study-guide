'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import LocalBankImport from './local-bank-import';
import {
  flashcardModules,
  parseFlashcardBank,
  selectFlashcards,
} from '../lib/flashcards';
import { shuffle } from '../lib/practice';

export default function FlashcardSession({ certificate }) {
  const [bank, setBank] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [randomOrder, setRandomOrder] = useState(false);
  const [deck, setDeck] = useState(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const heading = useRef(null);
  const modules = flashcardModules(bank);
  const pool = selectFlashcards(bank, selectedModules);

  useEffect(() => {
    heading.current?.focus();
  }, [deck, index]);

  function move(nextIndex) {
    setRevealed(false);
    setIndex(nextIndex);
  }

  function start() {
    if (!pool.length) return;
    setDeck(randomOrder ? shuffle(pool) : [...pool]);
    setIndex(0);
    setRevealed(false);
  }

  if (deck) {
    const card = deck[index];
    return (
      <Stack spacing={3} sx={{ mt: 3 }}>
        <Typography role="status" aria-label="Flash card progress">
          Card {index + 1} of {deck.length} · {card.moduleName}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={((index + 1) / deck.length) * 100}
          aria-label="Deck position"
        />
        <Paper
          component="section"
          aria-labelledby="flashcard-front"
          variant="outlined"
          sx={{ p: { xs: 2, sm: 4 } }}
        >
          <Stack spacing={3}>
            <Typography color="text.secondary">Question</Typography>
            <Typography
              id="flashcard-front"
              component="h2"
              variant="h5"
              tabIndex={-1}
              ref={heading}
              sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
            >
              {card.front}
            </Typography>
            <Box>
              <Button
                variant="contained"
                onClick={() => setRevealed(!revealed)}
                aria-expanded={revealed}
                aria-controls="flashcard-answer"
              >
                {revealed ? 'Hide answer' : 'Reveal answer'}
              </Button>
            </Box>
            {revealed && (
              <Stack
                id="flashcard-answer"
                spacing={2}
                role="region"
                aria-label="Flash card answer"
                aria-live="polite"
              >
                <Typography component="h3" variant="h6">
                  Answer
                </Typography>
                <Typography
                  sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {card.back}
                </Typography>
                <Typography component="h3" variant="subtitle1">
                  Explanation
                </Typography>
                <Typography
                  sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {card.explanation}
                </Typography>
                {card.reviewStatus === 'needs_release_review' && (
                  <Alert severity="info">
                    This card needs review against your ServiceNow release.
                  </Alert>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
          <Button
            variant="outlined"
            disabled={index === 0}
            onClick={() => move(index - 1)}
          >
            Previous card
          </Button>
          <Button
            variant="outlined"
            disabled={index === deck.length - 1}
            onClick={() => move(index + 1)}
          >
            Next card
          </Button>
          {index === deck.length - 1 && (
            <Button onClick={() => move(0)}>Study again</Button>
          )}
          <Button
            onClick={() => {
              setDeck(null);
              setRevealed(false);
            }}
          >
            Change modules
          </Button>
        </Stack>
        {index === deck.length - 1 && (
          <Typography color="text.secondary">
            Last card in this deck. Study again or choose different modules.
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <Typography>
        Import a question bank with flash cards, choose one or more modules, and
        reveal answers at your own pace.
      </Typography>
      <LocalBankImport
        certificate={certificate}
        parseBank={parseFlashcardBank}
        onBankChange={(questions) => {
          setBank(questions);
          setSelectedModules([]);
        }}
      />
      {bank.length > 0 && !modules.length && (
        <Alert severity="warning">
          This bank has no flash cards. Import a bank containing flashcards
          arrays, such as the updated CSA questions.json.
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Modules to study</FormLabel>
            {!bank.length && (
              <Typography sx={{ mt: 1 }}>
                Import a question bank to see available modules.
              </Typography>
            )}
            <FormGroup>
              {modules.map((module) => (
                <FormControlLabel
                  key={module.id}
                  label={`${module.name} (${module.count} cards)`}
                  control={
                    <Checkbox
                      checked={selectedModules.includes(module.id)}
                      onChange={(event) =>
                        setSelectedModules(
                          event.target.checked
                            ? [...selectedModules, module.id]
                            : selectedModules.filter((id) => id !== module.id),
                        )
                      }
                    />
                  }
                />
              ))}
            </FormGroup>
          </FormControl>
          {modules.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap' }}
              useFlexGap
            >
              <Button
                onClick={() =>
                  setSelectedModules(modules.map((module) => module.id))
                }
              >
                Select all modules
              </Button>
              <Button onClick={() => setSelectedModules([])}>
                Clear selection
              </Button>
            </Stack>
          )}
          <Typography role="status" aria-label="Selected flash cards">
            {pool.length} cards selected
          </Typography>
          <FormControlLabel
            label="Shuffle cards"
            control={
              <Checkbox
                checked={randomOrder}
                onChange={(event) => setRandomOrder(event.target.checked)}
              />
            }
          />
          <Box>
            <Button variant="contained" disabled={!pool.length} onClick={start}>
              Start flash cards
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
