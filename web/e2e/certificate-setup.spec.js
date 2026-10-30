import { test, expect } from '@playwright/test';

const bank = {
  certificate: 'csa',
  questions: [
    {
      questionId: 'shared-question',
      moduleId: 1,
      moduleName: 'Shared module',
      prompt: 'Shared question',
      questionType: 'single_choice',
      difficulty: 'easy',
      choices: [
        { id: 'A', text: 'Correct' },
        { id: 'B', text: 'Incorrect' },
      ],
      correctChoiceIds: ['A'],
      explanation: 'Shared explanation',
      flashcards: [
        {
          flashcardId: 'shared-card',
          front: 'Shared front',
          back: 'Shared back',
        },
      ],
    },
  ],
};

async function upload(page, value = bank) {
  await page.getByLabel('Question bank JSON file').setInputFiles({
    name: 'shared.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(value)),
  });
}

test('certificate import unlocks modes and shares the bank across modes', async ({
  page,
}) => {
  const warnings = [];
  page.on('console', (message) => {
    if (message.type() === 'error') warnings.push(message.text());
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Study CSA' }).click();
  await expect(page.getByLabel('Question bank JSON file')).toBeAttached();
  await expect(
    page.getByRole('link', { name: 'Open Practice quizzes' }),
  ).toHaveCount(0);
  await upload(page, { ...bank, certificate: 'cad' });
  await expect(page.getByRole('alert')).toContainText('This is a CAD bank');
  await expect(page.getByRole('link', { name: /Open / })).toHaveCount(0);
  await upload(page);
  await page.getByRole('link', { name: 'Open Practice quizzes' }).click();
  await expect(page.getByLabel('Shared module', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Question bank JSON file')).toHaveCount(0);
  await page.getByRole('link', { name: 'Back to CSA study modes' }).click();
  await page.getByRole('link', { name: 'Open Flash cards' }).click();
  await expect(
    page.getByLabel('Shared module (1 cards)', { exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Back to CSA study modes' }).click();
  await page
    .getByRole('link', { name: 'Open Who Wants to Be a Millionaire' })
    .click();
  await expect(page.getByText(/easy: 1, medium: 0, hard: 0/)).toBeVisible();
  await expect(page.getByLabel('Question bank JSON file')).toHaveCount(0);
  expect(
    warnings.filter((text) => text.includes('does not recognize')),
  ).toEqual([]);
  await page.reload();
  await expect(page).toHaveURL(/\/study\/csa$/);
  await expect(page.getByRole('link', { name: /Open / })).toHaveCount(0);
});

test('changing certificates requires a matching new bank and direct mode links require import', async ({
  page,
}) => {
  await page.goto('/study/csa');
  await upload(page);
  await page.getByRole('link', { name: 'Back to certifications' }).click();
  await page.getByRole('link', { name: 'Study CAD' }).click();
  await expect(page.getByRole('link', { name: /Open / })).toHaveCount(0);
  await upload(page);
  await expect(page.getByRole('alert')).toContainText('This is a CSA bank');
  await upload(page, { ...bank, certificate: 'cad' });
  await expect(
    page.getByRole('link', { name: 'Open Practice quizzes' }),
  ).toBeVisible();
  await page.goto('/study/csa/millionaire');
  await expect(page).toHaveURL(/\/study\/csa$/);
  await expect(page.getByLabel('Question bank JSON file')).toBeAttached();
});
