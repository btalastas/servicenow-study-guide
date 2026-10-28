'use client';

import { useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { parseQuestionBank } from '../lib/practice';

export default function LocalBankImport({ certificate, onBankChange }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);

  async function importFile(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    onBankChange([]);
    setName('');
    setError('');
    setReading(true);
    try {
      if (file.size > 10 * 1024 * 1024)
        throw Error('Choose a JSON file smaller than 10 MB.');
      const questions = parseQuestionBank(
        JSON.parse(await file.text()),
        certificate,
      );
      onBankChange(questions);
      setName(`${file.name}: ${questions.length} questions`);
    } catch (err) {
      const issue = err.issues?.[0];
      setError(
        issue
          ? `Invalid question bank (${issue.path.join('.') || 'questions'}): ${issue.message}`
          : err.message,
      );
    } finally {
      setReading(false);
      input.value = '';
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h5">
          Local question bank
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button component="label" variant="outlined" disabled={reading}>
            {reading
              ? 'Reading file…'
              : `Import ${certificate.toUpperCase()} question bank`}
            <input
              hidden
              type="file"
              accept=".json,application/json"
              aria-label="Question bank JSON file"
              onChange={importFile}
            />
          </Button>
          <Button href="/question-bank-template.json" download>
            Download JSON template
          </Button>
        </Stack>
        {name && <Typography>{name}</Typography>}
        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="body2" color="text.secondary">
          {certificate === 'csa'
            ? 'Use the existing data/question-bank/questions.json file or a CSA-labelled JSON bank.'
            : 'Import a JSON bank labelled certificate: cad. The existing project bank contains CSA material.'}{' '}
          Your file stays in this browser. No database requests are made. Local
          answer keys are inspectable, and game progress is lost if you leave or
          reload.
        </Typography>
      </Stack>
    </Paper>
  );
}
