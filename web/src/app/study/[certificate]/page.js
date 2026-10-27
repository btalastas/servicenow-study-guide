import { notFound } from 'next/navigation';
import Button from '../../../components/navigation-button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { certificates, studyModes } from '../../../lib/study-options';

export default async function CertificatePage({ params }) {
  const { certificate } = await params;
  if (!Object.hasOwn(certificates, certificate)) notFound();

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, sm: 8 } }}>
      <Button href="/" sx={{ mb: 3 }}>
        Back to certifications
      </Button>
      <Typography component="h1" variant="h3" gutterBottom>
        Study for {certificate.toUpperCase()}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {certificates[certificate]} — choose a study mode.
      </Typography>
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
    </Container>
  );
}
