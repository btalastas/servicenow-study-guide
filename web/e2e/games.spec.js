import { openStudyMode, prepareImport, finishImport } from './study-setup';
import { test, expect } from '@playwright/test';

function bank(modules = 6) {
  return Array.from({ length: modules }, (_, i) =>
    ['easy', 'medium', 'hard'].flatMap((difficulty) =>
      Array.from({ length: 3 }, (_, j) => ({
        questionId: `${i}-${difficulty}-${j}`,
        moduleId: i + 1,
        moduleName: `Module ${i + 1}`,
        prompt: `${difficulty} question ${i + 1}-${j}`,
        difficulty,
        questionType: 'single_choice',
        choices: [
          { id: 'A', text: 'Right choice' },
          { id: 'B', text: 'Wrong choice' },
        ],
        correctChoiceIds: ['A'],
        explanation: 'Explanation for this choice.',
      })),
    ),
  ).flat();
}

async function upload(page, questions = bank(), certificate = 'csa') {
  await prepareImport(page);
  await page.getByLabel('Question bank JSON file').setInputFiles({
    name: 'games.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ certificate, questions })),
  });
  await finishImport(page);
}

async function answerMillionaire(page, right = true) {
  await page
    .getByLabel(right ? 'Right choice' : 'Wrong choice', { exact: true })
    .check();
  await page.getByRole('button', { name: 'Final answer', exact: true }).click();
}

async function finishJeopardy(page) {
  await page.getByRole('button', { name: 'End game', exact: true }).click();
  await page.getByRole('button', { name: 'End and view results' }).click();
}

test('Jeopardy has five random module columns, two easy/two medium/one hard rows, and single-use scoring', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/jeopardy');
  await upload(page);
  await page.getByRole('button', { name: 'Start Jeopardy' }).click();
  const board = page.getByRole('table', { name: 'Jeopardy clues' });
  await expect(board.getByRole('columnheader')).toHaveCount(5);
  await expect(board.getByRole('button')).toHaveCount(25);
  await expect(
    board.getByRole('button', { name: /, \$100, easy$/ }),
  ).toHaveCount(5);
  await expect(
    board.getByRole('button', { name: /, \$200, easy$/ }),
  ).toHaveCount(5);
  await expect(
    board.getByRole('button', { name: /, \$300, medium$/ }),
  ).toHaveCount(5);
  await expect(
    board.getByRole('button', { name: /, \$400, medium$/ }),
  ).toHaveCount(5);
  await expect(
    board.getByRole('button', { name: /, \$500, hard$/ }),
  ).toHaveCount(5);
  const clue = board.getByRole('button', { name: /, \$100, easy$/ }).first();
  const label = await clue.getAttribute('aria-label');
  await clue.click();
  await page.getByLabel('Right choice', { exact: true }).check();
  await page
    .getByRole('button', { name: 'Submit answer', exact: true })
    .click();
  await expect(
    page.getByRole('status', { name: 'Answer feedback' }),
  ).toContainText('Correct');
  await expect(page.getByLabel('Wrong choice', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Back to board' }).click();
  await expect(
    board.getByRole('button', { name: label + ', played', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('status', { name: 'Jeopardy earnings' }),
  ).toHaveText('$100');
  await board
    .getByRole('button', { name: /, \$200, easy$/ })
    .first()
    .click();
  await page.getByLabel('Wrong choice', { exact: true }).check();
  await page
    .getByRole('button', { name: 'Submit answer', exact: true })
    .click();
  await expect(
    page.getByRole('status', { name: 'Answer feedback' }),
  ).toContainText('Incorrect');
  await page.getByRole('button', { name: 'Back to board' }).click();
  await expect(
    page.getByRole('status', { name: 'Jeopardy earnings' }),
  ).toHaveText('-$100');
  await finishJeopardy(page);
  await expect(
    page.getByRole('heading', { name: 'Jeopardy results' }),
  ).toBeVisible();
  await expect(page.getByLabel('Final earnings')).toHaveText('-$100');
  await expect(
    page.getByText('1 correct out of 2 played questions (50%).'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Set up another game' }).click();
  await page.getByRole('button', { name: 'Start Jeopardy' }).click();
  await expect(
    page.getByRole('status', { name: 'Jeopardy earnings' }),
  ).toHaveText('$0');
  await expect(
    page.getByRole('table').getByRole('button', { disabled: false }),
  ).toHaveCount(25);
});

test('Jeopardy completes all 25 clues without repeats and supports skip penalties', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/jeopardy');
  await upload(page);
  await page.getByRole('button', { name: 'Start Jeopardy' }).click();
  const seen = new Set();
  for (let i = 0; i < 25; i++) {
    await page
      .getByRole('table')
      .getByRole('button', { disabled: false })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    const prompt = await dialog
      .getByRole('heading', { level: 2 })
      .last()
      .textContent();
    expect(seen.has(prompt)).toBe(false);
    seen.add(prompt);
    await page.getByRole('button', { name: 'Skip clue', exact: true }).click();
    await expect(
      page.getByRole('status', { name: 'Answer feedback' }),
    ).toContainText('Unanswered');
    await page
      .getByRole('button', {
        name: i === 24 ? 'View results' : 'Back to board',
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole('heading', { name: 'Jeopardy results' }),
  ).toBeVisible();
  await expect(page.getByLabel('Final earnings')).toHaveText('-$7,500');
  await expect(
    page.getByText('0 correct out of 25 played questions (0%).'),
  ).toBeVisible();
});

test('games block incomplete banks and wrong-certificate imports', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/jeopardy');
  await upload(page, bank(4));
  await expect(
    page.getByRole('button', { name: 'Start Jeopardy' }),
  ).toBeDisabled();
  await expect(page.getByText(/4 modules qualify/)).toBeVisible();
  await openStudyMode(page, '/study/cad/millionaire');
  await upload(page);
  await expect(page.getByText(/This is a CSA bank/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Start Millionaire' }),
  ).toHaveCount(0);
  await upload(
    page,
    bank().filter((q) => q.difficulty !== 'hard'),
    'cad',
  );
  await expect(page.getByText(/hard: 0/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Start Millionaire' }),
  ).toBeDisabled();
});

test('Millionaire progresses through three tiers to one million without repeating questions', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/millionaire');
  await upload(page);
  await page.getByRole('button', { name: 'Start Millionaire' }).click();
  const seen = new Set();
  for (let i = 0; i < 15; i++) {
    const difficulty = i < 5 ? 'easy' : i < 10 ? 'medium' : 'hard';
    await expect(
      page.getByText(
        new RegExp(`Question ${i + 1} of 15 · ${difficulty} · for`),
      ),
    ).toBeVisible();
    const prompt = await page
      .getByRole('heading', { level: 2 })
      .first()
      .textContent();
    expect(seen.has(prompt)).toBe(false);
    seen.add(prompt);
    await answerMillionaire(page);
    await expect(
      page.getByLabel('Wrong choice', { exact: true }),
    ).toBeDisabled();
    if (i === 4)
      await expect(
        page.getByText('Guaranteed: $500', { exact: true }),
      ).toBeVisible();
    if (i === 9)
      await expect(
        page.getByText('Guaranteed: $25,000', { exact: true }),
      ).toBeVisible();
    await page
      .getByRole('button', {
        name: i === 14 ? 'View results' : 'Next question',
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole('heading', { name: 'Millionaire results' }),
  ).toBeVisible();
  await expect(page.getByLabel('Final earnings')).toHaveText('$1,000,000');
  await expect(
    page.getByText('15 correct out of 15 played questions (100%).'),
  ).toBeVisible();
});

test('Millionaire ends on a wrong answer at the last safe prize', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/millionaire');
  await upload(page);
  await page.getByRole('button', { name: 'Start Millionaire' }).click();
  for (let i = 0; i < 5; i++) {
    await answerMillionaire(page);
    await page
      .getByRole('button', { name: 'Next question', exact: true })
      .click();
  }
  await answerMillionaire(page, false);
  await expect(
    page.getByRole('status', { name: 'Millionaire earnings' }),
  ).toHaveText('$500');
  await expect(
    page.getByRole('button', { name: 'Next question', exact: true }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'View results', exact: true }).click();
  await expect(
    page.getByText('Game over. You keep your guaranteed prize of $500.'),
  ).toBeVisible();
  await expect(page.getByText('Your answer: Wrong choice')).toBeVisible();
  await page.getByRole('button', { name: 'Set up another game' }).click();
  await page.getByRole('button', { name: 'Start Millionaire' }).click();
  await expect(
    page.getByRole('status', { name: 'Millionaire earnings' }),
  ).toHaveText('$0');
});

test('Millionaire walk-away keeps current winnings without scoring the unanswered question', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/millionaire');
  await upload(page);
  await page.getByRole('button', { name: 'Start Millionaire' }).click();
  await answerMillionaire(page);
  await page
    .getByRole('button', { name: 'Next question', exact: true })
    .click();
  await page.getByRole('button', { name: 'Walk away', exact: true }).click();
  await page.getByRole('button', { name: 'Take prize and finish' }).click();
  await expect(page.getByLabel('Final earnings')).toHaveText('$10');
  await expect(
    page.getByText('1 correct out of 1 played questions (100%).'),
  ).toBeVisible();
});

test('Jeopardy ordering clues require exact order and remain locked after submission', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/jeopardy');
  const questions = bank(5).map((q) =>
    q.difficulty === 'hard'
      ? { ...q, questionType: 'ordering', correctChoiceIds: ['B', 'A'] }
      : q,
  );
  await upload(page, questions);
  await page.getByRole('button', { name: 'Start Jeopardy' }).click();
  await page
    .getByRole('table')
    .getByRole('button', { name: /, \$500, hard$/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Move step 2 up' }).click();
  await page
    .getByRole('button', { name: 'Submit answer', exact: true })
    .click();
  await expect(
    page.getByRole('status', { name: 'Answer feedback' }),
  ).toContainText('Correct');
  await expect(
    page.getByRole('button', { name: 'Move step 2 up' }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Back to board' }).click();
  await expect(
    page.getByRole('status', { name: 'Jeopardy earnings' }),
  ).toHaveText('$500');
});

test('Millionaire multi-select answers use exact-set scoring with no partial credit', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/millionaire');
  await upload(
    page,
    bank().map((q) => ({
      ...q,
      questionType: 'multiple_choice',
      correctChoiceIds: ['A', 'B'],
    })),
  );
  await page.getByRole('button', { name: 'Start Millionaire' }).click();
  await page.getByLabel('Right choice', { exact: true }).check();
  await page.getByRole('button', { name: 'Final answer', exact: true }).click();
  await expect(
    page.getByRole('status', { name: 'Answer feedback' }),
  ).toContainText('Incorrect');
  await page.getByRole('button', { name: 'View results', exact: true }).click();
  await expect(page.getByLabel('Final earnings')).toHaveText('$0');
});
