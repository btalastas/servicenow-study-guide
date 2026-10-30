import StudyBankProvider from '../../../components/study-bank-provider';

export default async function StudyLayout({ children, params }) {
  const { certificate } = await params;
  return <StudyBankProvider key={certificate}>{children}</StudyBankProvider>;
}
