import StudyModeSession from '../../../../components/study-mode-session';
import { notFound } from 'next/navigation';
import Button from '../../../../components/navigation-button';
import Container from '@mui/material/Container';
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
      <StudyModeSession
        key={certificate + mode}
        certificate={certificate}
        mode={mode}
      />
    </Container>
  );
}
