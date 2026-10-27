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
    description: 'Review questions and reveal answers at your own pace.',
  },
  jeopardy: {
    title: 'Jeopardy',
    description: 'Choose categories and practice with a game board.',
  },
  millionaire: {
    title: 'Who Wants to Be a Millionaire',
    description: 'Work your way through a series of questions.',
  },
};
