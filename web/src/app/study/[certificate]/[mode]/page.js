import LocalGameSession from '../../../../components/local-game-session';
import PracticeSession from '../../../../components/practice-session';
import { notFound } from 'next/navigation';
import Button from '../../../../components/navigation-button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { certificates, studyModes } from '../../../../lib/study-options';

export default async function StudyModePage({ params }) {
  const { certificate, mode } = await params;
  if (
    !Object.hasOwn(certificates, certificate) ||
    !Object.hasOwn(studyModes, mode)
  ) {
    notFound();
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, sm: 8 } }}>
      <Button href={`/study/${certificate}`} sx={{ mb: 3 }}>
        Back to {certificate.toUpperCase()} study modes
      </Button>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {certificate.toUpperCase()} · {certificates[certificate]}
      </Typography>
      <Typography component="h1" variant="h3" gutterBottom>
        {studyModes[mode].title}
      </Typography>
      {mode === 'practice-quiz' || mode === 'practice-exam' ? (
        <PracticeSession
          key={certificate + mode}
          certificate={certificate}
          mode={mode}
        />
      ) : mode === 'jeopardy' || mode === 'millionaire' ? (
        <LocalGameSession
          key={certificate + mode}
          certificate={certificate}
          mode={mode}
        />
      ) : (
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Typography component="h2" variant="h5" gutterBottom>
            Coming soon
          </Typography>
          <Typography>
            This study mode is being built. Choose another mode or return later
            to start practicing.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
