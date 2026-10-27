import Button from '../components/navigation-button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { certificates } from '../lib/study-options';

export default function Home() {
  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, sm: 8 } }}>
      <Typography component="h1" variant="h3" gutterBottom>
        ServiceNow Study Guide
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Choose the certification you want to study for.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        {Object.entries(certificates).map(([id, name]) => (
          <Paper key={id} variant="outlined" sx={{ p: 3, flex: 1 }}>
            <Typography component="h2" variant="h5" gutterBottom>
              {id.toUpperCase()}
            </Typography>
            <Typography sx={{ mb: 3 }}>{name}</Typography>
            <Button href={`/study/${id}`} variant="contained">
              Study {id.toUpperCase()}
            </Button>
          </Paper>
        ))}
      </Stack>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 4 }}>
        Supplementary practice for ServiceNow certifications.
      </Typography>
    </Container>
  );
}
