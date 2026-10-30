'use client';

import { Paper, Stack, Typography } from '@mui/material';
import Button from './navigation-button';
import LocalBankImport from './local-bank-import';
import { useStudyBank } from './study-bank-provider';
import { parseFlashcardBank } from '../lib/flashcards';
import { studyModes } from '../lib/study-options';

export default function CertificateSetup({ certificate }) {
  const { bank, setBank } = useStudyBank();
  return (
    <Stack spacing={3}>
      <Typography color="text.secondary">
        {bank.length
          ? 'Choose a study mode using your imported question bank.'
          : 'Import a question bank to choose a study mode.'}
      </Typography>
      <LocalBankImport
        certificate={certificate}
        parseBank={parseFlashcardBank}
        onBankChange={setBank}
      />
      {bank.length > 0 && (
        <Stack spacing={2}>
          {Object.entries(studyModes).map(([id, mode]) => (
            <Paper key={id} variant="outlined" sx={{ p: 3 }}>
              <Typography component="h2" variant="h5" gutterBottom>
                {mode.title}
              </Typography>
              <Typography sx={{ mb: 2 }}>{mode.description}</Typography>
              <Button href={`/study/${certificate}/${id}`} variant="outlined">
                Open {mode.title}
              </Button>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
