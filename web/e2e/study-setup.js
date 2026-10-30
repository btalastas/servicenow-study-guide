import { expect } from '@playwright/test';

const destinations = new WeakMap();

export async function openStudyMode(page, path) {
  destinations.set(page, path);
  await page.goto(path.split('/').slice(0, 3).join('/'));
}

export async function prepareImport(page) {
  const input = page.getByLabel('Question bank JSON file');
  if (!(await input.count())) {
    await page.getByRole('link', { name: /Back to .* study modes/ }).click();
  }
}

export async function finishImport(page) {
  const path = destinations.get(page);
  const link = page.locator(`a[href="${path}"]`);
  // Import validation either reveals study modes or shows an error.
  await expect(page.locator('main')).toContainText(
    /Choose a study mode using|Invalid question bank|This is a .* bank|CAD banks must|IDs must|must belong/,
  );
  if (await link.count()) await link.click();
}
