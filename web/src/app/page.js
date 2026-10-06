import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Container component="main" maxWidth="md" sx={{ py: 8 }}>
      <Typography component="h1" variant="h3" gutterBottom>
        ServiceNow Study Guide
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Supplementary practice for the CSA and CAD certifications.
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography component="h2" variant="h5" gutterBottom>
          Study modes are coming soon
        </Typography>
        <Typography>
          Flash cards, Jeopardy, and Who Wants to Be a Millionaire are planned,
          with questions selected by module and difficulty.
        </Typography>
      </Paper>
    </Container>
  );
}
