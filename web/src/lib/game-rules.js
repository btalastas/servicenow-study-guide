import { shuffle } from './practice.js';

export const JEOPARDY_ROWS = [
  { amount: 100, difficulty: 'easy' },
  { amount: 200, difficulty: 'easy' },
  { amount: 300, difficulty: 'medium' },
  { amount: 400, difficulty: 'medium' },
  { amount: 500, difficulty: 'hard' },
];

export const MILLIONAIRE_LADDER = [
  10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 250000,
  500000, 1000000,
].map((amount, index) => ({
  amount,
  difficulty: index < 5 ? 'easy' : index < 10 ? 'medium' : 'hard',
  checkpoint: index === 4 || index === 9,
}));

export function money(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function answerText(question, ids) {
  if (!ids?.length) return 'Unanswered';
  return ids
    .map((id) => question.choices.find((c) => c.id === id)?.text ?? id)
    .join(question.questionType === 'ordering' ? ' → ' : '; ');
}

export function jeopardyModules(bank) {
  const groups = new Map();
  for (const q of bank) {
    const id = String(q.moduleId);
    if (!groups.has(id))
      groups.set(id, { id, name: q.moduleName, questions: [] });
    groups.get(id).questions.push(q);
  }
  return [...groups.values()].filter((group) =>
    ['easy', 'medium', 'hard'].every(
      (difficulty) =>
        group.questions.filter((q) => q.difficulty === difficulty).length >=
        (difficulty === 'hard' ? 1 : 2),
    ),
  );
}

export function createJeopardyBoard(bank) {
  const eligible = jeopardyModules(bank);
  if (eligible.length < 5)
    throw Error(
      `Only ${eligible.length} modules qualify. Jeopardy needs five modules with at least two easy, two medium, and one hard question each.`,
    );
  return shuffle(eligible)
    .slice(0, 5)
    .map((group) => {
      const pools = Object.fromEntries(
        ['easy', 'medium', 'hard'].map((difficulty) => [
          difficulty,
          shuffle(group.questions.filter((q) => q.difficulty === difficulty)),
        ]),
      );
      return {
        id: group.id,
        name: group.name,
        clues: JEOPARDY_ROWS.map((row) => ({
          ...row,
          question: pools[row.difficulty].pop(),
        })),
      };
    });
}

export function millionairePools(bank) {
  // Ordering cannot be represented as a multiple-choice question without changing its meaning.
  return Object.fromEntries(
    ['easy', 'medium', 'hard'].map((difficulty) => [
      difficulty,
      bank.filter(
        (q) => q.difficulty === difficulty && q.questionType !== 'ordering',
      ),
    ]),
  );
}

export function createMillionaireQuestions(bank) {
  const pools = millionairePools(bank);
  const shortages = Object.entries(pools).filter(
    ([, questions]) => questions.length < 5,
  );
  if (shortages.length)
    throw Error(
      `Millionaire needs five choice-based questions per difficulty. Available: ${Object.entries(
        pools,
      )
        .map(([tier, questions]) => `${tier}: ${questions.length}`)
        .join(', ')}.`,
    );
  return ['easy', 'medium', 'hard'].flatMap((tier) =>
    shuffle(pools[tier]).slice(0, 5),
  );
}

export function guaranteedPrize(correctCount) {
  return correctCount >= 10 ? 25000 : correctCount >= 5 ? 500 : 0;
}
