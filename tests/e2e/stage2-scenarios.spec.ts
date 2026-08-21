import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('storefront-favorites-v1');
    localStorage.removeItem('storefront-location-v1');
    sessionStorage.removeItem('storefront-location-prompt-dismissed');
  });
});

test('confirms the city locally and does not prompt again after reload', async ({ page }) => {
  await page.reload();

  const cityPopover = page.getByRole('dialog', { name: 'Выберите город' });
  await expect(cityPopover).toBeVisible();
  await cityPopover.getByLabel('Город').selectOption('Самара');
  await cityPopover.getByRole('button', { name: 'Подтвердить' }).click();

  await expect(page.getByRole('button', { name: 'Ваш город: Самара' })).toBeVisible();
  await expect(cityPopover).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('storefront-location-v1')))
    .toContain('Самара');

  await page.reload();
  await expect(page.getByRole('button', { name: 'Ваш город: Самара' })).toBeVisible();
  await expect(cityPopover).toBeHidden();
});

test('saves a catalog product locally and removes it from favorites', async ({ page }) => {
  await page.goto('/catalog');
  await page.getByTitle('Добавить в избранное').first().click();
  await page.getByLabel('Избранное', { exact: true }).first().click();

  await expect(page.getByRole('heading', { level: 1, name: 'Избранное' })).toBeVisible();
  await expect(page.getByTitle('Удалить из избранного')).toHaveCount(1);

  await page.reload();
  await expect(page.getByTitle('Удалить из избранного')).toHaveCount(1);
  await page.getByTitle('Удалить из избранного').click();
  await expect(page.getByText('В избранном пока ничего нет')).toBeVisible();
});

test('validates and completes the demo selection request without sending data', async ({
  page,
}) => {
  await page.goto('/selection-help');
  await page.getByRole('button', { name: 'Проверить демонстрационный запрос' }).click();

  await expect(page.getByText('Укажите имя.')).toBeVisible();
  await page.getByLabel('Имя *').fill('Анна');
  await page.getByLabel('Как с вами связаться *').fill('@anna');
  await page.getByLabel('Задача *').fill('Нужна труба для подачи воды на участке');
  await page.getByRole('button', { name: 'Проверить демонстрационный запрос' }).click();

  await expect(
    page.getByRole('heading', { name: 'Демонстрационный запрос обработан' }),
  ).toBeVisible();
});
