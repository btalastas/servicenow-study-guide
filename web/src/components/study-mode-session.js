'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyBank } from './study-bank-provider';
import PracticeSession from './practice-session';
import LocalGameSession from './local-game-session';
import FlashcardSession from './flashcard-session';

export default function StudyModeSession({ certificate, mode }) {
  const { bank } = useStudyBank();
  const router = useRouter();
  useEffect(() => {
    if (!bank.length) router.replace(`/study/${certificate}`);
  }, [bank.length, certificate, router]);
  if (!bank.length) return null;
  if (mode === 'practice-quiz' || mode === 'practice-exam')
    return (
      <PracticeSession bank={bank} certificate={certificate} mode={mode} />
    );
  if (mode === 'jeopardy' || mode === 'millionaire')
    return <LocalGameSession bank={bank} mode={mode} />;
  return <FlashcardSession bank={bank} />;
}
