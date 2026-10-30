import CertificateSetup from '../../../components/certificate-setup';
import { notFound } from 'next/navigation';
import Button from '../../../components/navigation-button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { certificates } from '../../../lib/study-options';

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
      <CertificateSetup certificate={certificate} />
    </Container>
  );
}
