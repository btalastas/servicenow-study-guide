import { openStudyMode, prepareImport, finishImport } from './study-setup';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';

function questions() {
  return [1, 2].map((moduleId) => ({
    questionId: `q${moduleId}`,
    moduleId,
    moduleName: `Module ${moduleId}`,
    prompt: 'Practice prompt',
    difficulty: 'easy',
    questionType: 'single_choice',
    choices: [
      { id: 'A', text: 'Right' },
      { id: 'B', text: 'Wrong' },
    ],
    correctChoiceIds: ['A'],
    explanation: 'Source explanation',
    flashcards: [1, 2].map((n) => ({
      flashcardId: `fc${moduleId}-${n}`,
      front: `Recall ${moduleId}-${n}`,
      back: `Answer ${moduleId}-${n}`,
      explanation: `Explanation ${moduleId}-${n}`,
    })),
  }));
}

async function upload(page, value = questions()) {
  await prepareImport(page);
  await page.getByLabel('Question bank JSON file').setInputFiles({
    name: 'cards.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(value)),
  });
  await finishImport(page);
}

test('select a module, reveal answers, navigate without answer leakage, and change modules', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/flash-cards');
  const start = page.getByRole('button', { name: 'Start flash cards' });
  await expect(start).toHaveCount(0);
  await upload(page);
  await expect(start).toBeDisabled();
  await page.getByLabel('Module 2 (2 cards)', { exact: true }).check();
  await expect(page.getByLabel('Selected flash cards')).toHaveText(
    '2 cards selected',
  );
  await start.click();
  await expect(page.getByRole('heading', { name: 'Recall 2-1' })).toBeFocused();
  await expect(page.getByText('Answer 2-1', { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Previous card' }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Reveal answer' }).click();
  await expect(
    page.getByRole('region', { name: 'Flash card answer' }),
  ).toContainText('Answer 2-1');
  await expect(
    page.getByRole('region', { name: 'Flash card answer' }),
  ).toContainText('Explanation 2-1');
  await page.getByRole('button', { name: 'Next card' }).click();
  await expect(page.getByLabel('Flash card progress')).toContainText(
    'Card 2 of 2',
  );
  await expect(
    page.getByRole('region', { name: 'Flash card answer' }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next card' })).toBeDisabled();
  await page.getByRole('button', { name: 'Previous card' }).click();
  await expect(
    page.getByRole('region', { name: 'Flash card answer' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Next card' }).click();
  await page.getByRole('button', { name: 'Study again' }).click();
  await expect(page.getByLabel('Flash card progress')).toContainText(
    'Card 1 of 2',
  );
  await page.getByRole('button', { name: 'Change modules' }).click();
  await page.getByRole('button', { name: 'Select all modules' }).click();
  await expect(page.getByLabel('Selected flash cards')).toHaveText(
    '4 cards selected',
  );
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await expect(start).toBeDisabled();
});

test('actual CSA bank exposes eight modules and 454 cards on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStudyMode(page, '/study/csa/flash-cards');
  await upload(
    page,
    JSON.parse(
      fs.readFileSync(
        new URL('../../data/question-bank/questions.json', import.meta.url),
        'utf8',
      ),
    ),
  );
  await expect(
    page.getByLabel('Data management (87 cards)', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Select all modules' }).click();
  await expect(page.getByLabel('Selected flash cards')).toHaveText(
    '454 cards selected',
  );
  await page.getByLabel('Shuffle cards', { exact: true }).check();
  await page.getByRole('button', { name: 'Start flash cards' }).click();
  await expect(page.getByLabel('Flash card progress')).toContainText(
    'Card 1 of 454',
  );
  await page.getByRole('button', { name: 'Reveal answer' }).click();
  await expect(
    page.getByRole('region', { name: 'Flash card answer' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('empty, invalid, and wrong-certificate banks cannot start a stale deck', async ({
  page,
}) => {
  await openStudyMode(page, '/study/csa/flash-cards');
  await upload(page);
  await page.getByRole('button', { name: 'Select all modules' }).click();
  const malformed = questions();
  malformed[0].flashcards[0].back = '';
  await upload(page, malformed);
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'Invalid question bank',
  );
  await expect(
    page.getByRole('button', { name: 'Start flash cards' }),
  ).toHaveCount(0);
  await upload(
    page,
    questions().map((question) => {
      const legacy = { ...question };
      delete legacy.flashcards;
      return legacy;
    }),
  );
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'This bank has no flash cards',
  );
  await openStudyMode(page, '/study/cad/flash-cards');
  await upload(page);
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'CAD banks must include',
  );
  await upload(page, { certificate: 'cad', questions: questions() });
  await page.getByLabel('Module 1 (2 cards)', { exact: true }).check();
  await page.getByRole('button', { name: 'Start flash cards' }).click();
  await expect(page.getByRole('heading', { name: 'Recall 1-1' })).toBeVisible();
});
