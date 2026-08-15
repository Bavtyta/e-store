import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openCatalog(page: Page): Promise<void> {
  await page.goto('/catalog');
  await expect(page.getByRole('heading', { name: 'Каталог товаров' })).toBeVisible();
  await expect(page.getByText(/Найдено товаров:/)).toBeVisible();
}

test('navigates to a filtered catalog from the header search', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Поиск по каталогу').fill('ПВХ');
  await page.getByLabel('Поиск по каталогу').press('Enter');

  await expect(page).toHaveURL(/\/catalog\?search=/);
  await expect(page.getByRole('heading', { name: 'Каталог товаров' })).toBeVisible();
  await expect(page.getByLabel('Поиск товаров')).toHaveValue('ПВХ');
  await expect(page.getByText('Труба ПВХ канализационная 110 мм')).toBeVisible();
});

test('filters the catalog live by material and diameter and resets filters', async ({ page }) => {
  await openCatalog(page);

  await page.getByRole('combobox', { name: 'Материал' }).selectOption('ПВХ');
  await expect(page.getByRole('combobox', { name: 'Материал' })).toHaveValue('ПВХ');
  await page.getByRole('checkbox', { name: '110' }).click();
  await expect(page.getByRole('checkbox', { name: '110' })).toBeChecked();

  await expect
    .poll(() => decodeURIComponent(page.url()))
    .toContain('/catalog?filter[material]=ПВХ');
  await expect(page).toHaveURL(/filter%5Bdiameter%5D=110/);
  await expect(page.getByText('Труба ПВХ канализационная 110 мм')).toBeVisible();
  await expect(page.getByText('Труба ПНД PE100 питьевая')).toBeHidden();

  await page.getByRole('button', { name: 'Сбросить фильтры' }).click();

  await expect(page.getByText('Труба ПНД PE100 питьевая')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Материал' })).toHaveValue('');
});

test('adds a product to the cart directly from its card', async ({ page }) => {
  await openCatalog(page);

  await page.getByRole('button', { name: 'В корзину' }).first().click();

  await expect(page.getByLabel('В корзине позиций: 1')).toBeVisible();
});

test('keeps mobile menu focus trapped and restores focus to the opener', async ({ page }) => {
  await page.setViewportSize({ height: 812, width: 375 });
  await page.goto('/');

  const opener = page.getByRole('button', { name: 'Открыть меню' });

  await expect(opener).toBeVisible();
  await opener.click();

  const dialog = page.getByRole('dialog', { name: 'BELT' });
  const closeButton = dialog.getByRole('button', { name: 'Закрыть меню' });
  const cartLink = dialog.getByRole('link', { name: 'Корзина' });

  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(cartLink).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
});
