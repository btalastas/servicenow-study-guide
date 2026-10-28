import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createJeopardyBoard,
  createMillionaireQuestions,
  guaranteedPrize,
  JEOPARDY_ROWS,
  jeopardyModules,
  MILLIONAIRE_LADDER,
  millionairePools,
} from '../src/lib/game-rules.js';

function bank(modules = 6) {
  return Array.from({ length: modules }, (_, i) =>
    ['easy', 'medium', 'hard'].flatMap((difficulty) =>
      Array.from({ length: 3 }, (_, j) => ({
        questionId: `${i}-${difficulty}-${j}`,
        moduleId: i + 1,
        moduleName: `Module ${i + 1}`,
        difficulty,
        questionType: 'single_choice',
        choices: [
          { id: 'A', text: 'Right' },
          { id: 'B', text: 'Wrong' },
        ],
        correctChoiceIds: ['A'],
      })),
    ),
  ).flat();
}

test('Jeopardy samples five modules and preserves exact row difficulties without repeats', (t) => {
  t.mock.method(Math, 'random', () => 0);
  const source = bank();
  const snapshot = JSON.stringify(source);
  const columns = createJeopardyBoard(source);
  assert.equal(columns.length, 5);
  assert.equal(new Set(columns.map((column) => column.id)).size, 5);
  assert.notDeepEqual(
    columns.map((column) => column.id),
    ['1', '2', '3', '4', '5'],
  );
  for (const column of columns) {
    assert.deepEqual(
      column.clues.map(({ amount, difficulty }) => ({ amount, difficulty })),
      JEOPARDY_ROWS,
    );
    assert.ok(
      column.clues.every(
        (clue) =>
          String(clue.question.moduleId) === column.id &&
          clue.question.difficulty === clue.difficulty,
      ),
    );
  }
  assert.equal(
    new Set(
      columns.flatMap((column) =>
        column.clues.map((clue) => clue.question.questionId),
      ),
    ).size,
    25,
  );
  assert.equal(JSON.stringify(source), snapshot);
});

test('Jeopardy only selects modules that can fill all five rows', () => {
  const source = bank().filter(
    (q) => q.moduleId !== 6 || q.difficulty !== 'hard',
  );
  assert.equal(jeopardyModules(source).length, 5);
  assert.ok(createJeopardyBoard(source).every((column) => column.id !== '6'));
  assert.throws(
    () => createJeopardyBoard(source.filter((q) => q.moduleId !== 5)),
    /Only 4 modules qualify/,
  );
});

test('Millionaire uses five choice questions at each tier from the full bank', () => {
  const source = bank();
  const order = {
    ...source[0],
    questionId: 'ordering',
    questionType: 'ordering',
  };
  const questions = createMillionaireQuestions([...source, order]);
  assert.equal(questions.length, 15);
  assert.equal(new Set(questions.map((q) => q.questionId)).size, 15);
  assert.deepEqual(
    questions.map((q) => q.difficulty),
    [
      ...Array(5).fill('easy'),
      ...Array(5).fill('medium'),
      ...Array(5).fill('hard'),
    ],
  );
  assert.ok(questions.every((q) => q.questionType !== 'ordering'));
  assert.equal(millionairePools([...source, order]).easy.length, 18);
});

test('Millionaire includes multi-answer, scenario, and true/false choices but not ordering', () => {
  const source = bank();
  source[0].questionType = 'multiple_choice';
  source[1].questionType = 'scenario';
  source[2].questionType = 'true_false';
  assert.equal(millionairePools(source).easy.length, 18);
});

test('Millionaire rejects missing tiers instead of substituting easier questions', () => {
  assert.throws(
    () =>
      createMillionaireQuestions(bank().filter((q) => q.difficulty !== 'hard')),
    /five choice-based questions per difficulty/,
  );
  assert.throws(
    () =>
      createMillionaireQuestions(
        bank().map((q) => ({ ...q, questionType: 'ordering' })),
      ),
    /Available: easy: 0, medium: 0, hard: 0/,
  );
});

test('Millionaire ladder and guaranteed prizes change at the configured checkpoints', () => {
  assert.equal(MILLIONAIRE_LADDER.length, 15);
  assert.equal(MILLIONAIRE_LADDER[0].amount, 10);
  assert.equal(MILLIONAIRE_LADDER[14].amount, 1000000);
  assert.ok(
    MILLIONAIRE_LADDER.every(
      (level, i) => !i || level.amount > MILLIONAIRE_LADDER[i - 1].amount,
    ),
  );
  assert.deepEqual(
    [0, 4, 5, 9, 10, 15].map(guaranteedPrize),
    [0, 0, 500, 500, 25000, 25000],
  );
});
