import { test, expect } from '@playwright/test';

const question = (id, moduleId = 1) => ({
  questionId: `q-${id}`,
  moduleId,
  moduleName: `Module ${moduleId}`,
  prompt: `Question ${id}`,
  choices: [
    { id: 'A', text: 'Right choice' },
    { id: 'B', text: 'Wrong choice' },
  ],
  correctChoiceIds: ['A'],
  explanation: 'This is the reasoning.',
  questionType: 'single_choice',
  difficulty: 'easy',
});

async function upload(page, questions, certificate = 'csa') {
  await page.getByLabel('Question bank JSON file').setInputFiles({
    name: 'bank.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ certificate, questions })),
  });
}

async function submit(page, type = 'quiz') {
  await page
    .getByRole('button', { name: `Finish ${type}`, exact: true })
    .click();
  await page.getByRole('button', { name: 'Submit and view results' }).click();
}

test('quiz filters modules and locks answers after instant feedback', async ({
  page,
}) => {
  await page.goto('/study/csa/practice-quiz');
  await upload(page, [question(1), question(2, 2)]);
  await page.getByLabel('Module 2', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Start quiz' }).click();
  await expect(
    page.getByRole('heading', { name: 'Question 1', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Wrong choice', { exact: true }).check();
  await expect(page.getByText('This is the reasoning.')).not.toBeVisible();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('status')).toContainText('Incorrect');
  await expect(page.getByRole('status')).toContainText(
    'This is the reasoning.',
  );
  await expect(page.getByLabel('Right choice', { exact: true })).toBeDisabled();
  await submit(page);
  await expect(page.getByText('0%', { exact: true })).toBeVisible();
  await expect(page.getByText('Your answer: Wrong choice')).toBeVisible();
  await expect(
    page.getByText('Module 1: 0/1 correct (0%) — review recommended'),
  ).toBeVisible();
  await expect(page.getByText(/Module 2:/)).not.toBeVisible();
});

test('deferred feedback stays hidden until submission; skipped questions count as wrong', async ({
  page,
}) => {
  await page.goto('/study/csa/practice-quiz');
  await upload(page, [question(1)]);
  await page.getByLabel('Feedback at the end', { exact: true }).check();
  await page.getByRole('button', { name: 'Start quiz' }).click();
  await expect(
    page.getByRole('button', { name: 'Check answer' }),
  ).not.toBeVisible();
  await expect(page.getByText('This is the reasoning.')).not.toBeVisible();
  await submit(page);
  await expect(page.getByText('Your answer: Unanswered')).toBeVisible();
  await expect(page.getByText('This is the reasoning.')).toBeVisible();
});

test('multi-select and ordering use exact scoring', async ({ page }) => {
  await page.goto('/study/csa/practice-quiz');
  const multi = {
    ...question(1),
    questionType: 'multiple_choice',
    choices: [
      { id: 'A', text: 'Choice A' },
      { id: 'B', text: 'Choice B' },
      { id: 'C', text: 'Choice C' },
    ],
    correctChoiceIds: ['A', 'B'],
  };
  await upload(page, [multi]);
  await page.getByRole('button', { name: 'Start quiz' }).click();
  await page.getByLabel('Choice A', { exact: true }).check();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('status')).toContainText('Incorrect');
  await submit(page);
  await expect(page.getByText('0%', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Set up another quiz' }).click();
  await upload(page, [
    { ...question(2), questionType: 'ordering', correctChoiceIds: ['B', 'A'] },
  ]);
  await page.getByRole('button', { name: 'Start quiz' }).click();
  await page.getByRole('button', { name: 'Move step 2 up' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('status')).toContainText('Correct');
  await submit(page);
  await expect(page.getByText('100%', { exact: true })).toBeVisible();
});

test('exam requires 60 questions, permits review, and defers feedback', async ({
  page,
}) => {
  await page.goto('/study/cad/practice-exam');
  await upload(page, [question(1)], 'cad');
  await expect(page.getByRole('button', { name: 'Start exam' })).toBeDisabled();
  await upload(
    page,
    Array.from({ length: 60 }, (_, i) => question(i)),
    'cad',
  );
  await page.getByRole('button', { name: 'Start exam' }).click();
  await expect(page.getByRole('timer')).toContainText('90:00');
  await page.getByLabel('Right choice', { exact: true }).check();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'Previous question' }).click();
  await expect(page.getByLabel('Right choice', { exact: true })).toBeChecked();
  await expect(page.getByText('This is the reasoning.')).not.toBeVisible();
  await submit(page, 'exam');
  await expect(page.getByText(/1 correct out of 60 questions/)).toBeVisible();
  await expect(page.getByText('2%', { exact: true })).toBeVisible();
});

test('exam submits automatically on expiry and includes unanswered questions', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/study/csa/practice-exam');
  await upload(
    page,
    Array.from({ length: 60 }, (_, i) => question(i)),
  );
  await page.getByRole('button', { name: 'Start exam' }).click();
  await page.getByLabel('Right choice', { exact: true }).check();
  await page.clock.fastForward(90 * 60 * 1000 + 1000);
  await expect(
    page.getByRole('heading', { name: 'Exam results' }),
  ).toBeVisible();
  await expect(
    page.getByText('Time expired. Your exam was submitted automatically.'),
  ).toBeVisible();
  await expect(page.getByText(/1 correct out of 60 questions/)).toBeVisible();
});

test('rejects wrong-certificate and invalid banks; empty module selection cannot start', async ({
  page,
}) => {
  await page.goto('/study/cad/practice-quiz');
  await upload(page, [question(1)], 'csa');
  await expect(
    page.getByRole('alert').filter({ hasText: 'This is a CSA bank' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start quiz' })).toBeDisabled();
  await upload(
    page,
    [{ ...question(1), correctChoiceIds: ['missing'] }],
    'cad',
  );
  await expect(
    page.getByRole('alert').filter({ hasText: 'Invalid question bank' }),
  ).toBeVisible();
  await upload(page, [question(1), question(1)], 'cad');
  await expect(page.getByText('Question IDs must be unique.')).toBeVisible();
  await upload(page, [question(1)], 'cad');
  await page.getByLabel('All modules', { exact: true }).uncheck();
  await expect(page.getByRole('button', { name: 'Start quiz' })).toBeDisabled();
});

test('quiz draws the requested number of unique questions only from selected modules', async ({
  page,
}) => {
  await page.goto('/study/csa/practice-quiz');
  await upload(
    page,
    Array.from({ length: 9 }, (_, i) => question(i, Math.floor(i / 3) + 1)),
  );
  await page.getByLabel('Module 3', { exact: true }).uncheck();
  const amount = page.getByRole('spinbutton', { name: 'Number of questions' });
  await amount.fill('7');
  await expect(page.getByRole('button', { name: 'Start quiz' })).toBeDisabled();
  await amount.fill('3');
  await page.getByRole('button', { name: 'Start quiz' }).click();
  const prompts = [];
  for (let i = 0; i < 3; i++) {
    await expect(
      page.getByText(`Question ${i + 1} of 3`, { exact: true }),
    ).toBeVisible();
    const prompt = await page.getByRole('heading', { level: 2 }).textContent();
    expect(Number(prompt.split(' ')[1])).toBeLessThan(6);
    prompts.push(prompt);
    if (i < 2)
      await page.getByRole('button', { name: 'Next question' }).click();
  }
  expect(new Set(prompts).size).toBe(3);
  await expect(
    page.getByRole('button', { name: 'Next question' }),
  ).toBeDisabled();
  await submit(page);
  await expect(page.getByText(/0 correct out of 3 questions/)).toBeVisible();
});

test('exam accepts 60–80 questions and validates count against its bank', async ({
  page,
}) => {
  await page.goto('/study/csa/practice-exam');
  await upload(
    page,
    Array.from({ length: 80 }, (_, i) => question(i)),
  );
  const amount = page.getByRole('spinbutton', { name: 'Number of questions' });
  for (const invalid of ['59', '81', '60.5', '']) {
    await amount.fill(invalid);
    await expect(
      page.getByRole('button', { name: 'Start exam' }),
    ).toBeDisabled();
  }
  await amount.fill('70');
  await expect(page.getByRole('button', { name: 'Start exam' })).toBeEnabled();
  await amount.fill('80');
  await page.getByRole('button', { name: 'Start exam' }).click();
  await expect(
    page.getByText('Question 1 of 80', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('timer')).toContainText('90:00');
  await submit(page, 'exam');
  await expect(page.getByText(/0 correct out of 80 questions/)).toBeVisible();
  await page.getByRole('button', { name: 'Set up another exam' }).click();
  await upload(
    page,
    Array.from({ length: 60 }, (_, i) => question(i)),
  );
  await expect(page.getByRole('button', { name: 'Start exam' })).toBeDisabled();
  await amount.fill('60');
  await expect(page.getByRole('button', { name: 'Start exam' })).toBeEnabled();
});
