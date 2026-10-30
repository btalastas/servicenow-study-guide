export const certificates = {
  csa: 'Certified System Administrator',
  cad: 'Certified Application Developer',
};

export const examSettings = {
  csa: { minutes: 90, questionCount: 60, minQuestions: 60, maxQuestions: 80 },
  cad: { minutes: 90, questionCount: 60, minQuestions: 60, maxQuestions: 80 },
};

export const studyModes = {
  'practice-quiz': {
    title: 'Practice quizzes',
    description:
      'Choose modules and practice with instant feedback or an end-of-quiz review.',
  },
  'practice-exam': {
    title: 'Practice exams',
    description:
      'Take a timed exam and review your score, missed questions, and study priorities.',
  },
  'flash-cards': {
    title: 'Flash cards',
    description:
      'Choose modules and study flash cards with answers you reveal at your own pace.',
  },
  jeopardy: {
    title: 'Jeopardy',
    description:
      'Play a five-module board with increasing difficulty and track your winnings.',
  },
  millionaire: {
    title: 'Who Wants to Be a Millionaire',
    description:
      'Climb from $10 to $1,000,000 as questions progress from easy to hard.',
  },
};
