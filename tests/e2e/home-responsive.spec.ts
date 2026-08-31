import { expect, test } from '@playwright/test';

const VIEWPORTS = [320, 375, 768, 1024, 1440] as const;

for (const width of VIEWPORTS) {
  test(`keeps the home header and hero stable at ${String(width)}px`, async ({ page }) => {
    await page.setViewportSize({ height: 900, width });
    await page.goto('/');

    const search = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
    const hero = page.getByRole('region', { name: 'Главный баннер' });
    const cta = hero.getByRole('link', { name: 'Выбрать товар' });

    await expect(search).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(cta).toBeVisible();

    const shell = search.locator('..');
    const shellBeforeFocus = await shell.boundingBox();
    await search.focus();
    const shellAfterFocus = await shell.boundingBox();

    expect(shellAfterFocus?.height).toBe(shellBeforeFocus?.height);
    expect(shellAfterFocus?.width).toBe(shellBeforeFocus?.width);
    expect(
      await cta.evaluate((element) => element.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}

test('keeps the home page usable at a 200 percent effective zoom', async ({ page }) => {
  // A 1280px viewport at 200% browser zoom has an effective CSS width of 640px.
  await page.setViewportSize({ height: 900, width: 640 });
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Открыть меню' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Поиск по каталогу' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Выбрать товар' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
