import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openCatalog(page: Page): Promise<void> {
  await page.goto('/catalog');
  await expect(page.getByRole('heading', { name: 'Каталог товаров' })).toBeVisible();
  await expect(page.getByText(/Найдено товаров:/)).toBeVisible();
}

test('navigates to a filtered catalog from the header search', async ({ page }) => {
  await page.goto('/');

  const searchTrigger = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  await searchTrigger.click();

  const searchDialog = page.getByRole('dialog', { name: 'Поиск по каталогу' });
  const searchInput = searchDialog.getByRole('searchbox', {
    name: 'Товар, категория или характеристика',
  });

  await expect(searchInput).toBeFocused();
  await searchInput.fill('ПВХ');
  await searchInput.press('Enter');

  await expect(page).toHaveURL(/\/catalog\?search=/);
  await expect(page.getByRole('heading', { name: 'Каталог товаров' })).toBeVisible();
  await expect(page.getByLabel('Поиск товаров')).toHaveValue('ПВХ');
  await expect(page.getByText('Труба ПВХ канализационная 110 мм')).toBeVisible();
});

test('supports keyboard result selection and restores focus after closing search', async ({
  page,
}) => {
  await page.goto('/');

  const searchTrigger = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  await searchTrigger.click();

  const searchDialog = page.getByRole('dialog', { name: 'Поиск по каталогу' });
  const searchInput = searchDialog.getByRole('searchbox', {
    name: 'Товар, категория или характеристика',
  });

  await searchInput.fill('PE100');
  await expect(searchDialog.getByText('Труба ПНД PE100 питьевая')).toBeVisible();
  await searchInput.press('ArrowDown');
  await searchInput.press('Enter');

  await expect(page).toHaveURL(/\/product\/truba-pnd-pe100-pitevaya/);

  await page.getByRole('searchbox', { name: 'Поиск по каталогу' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Поиск по каталогу' })).toBeHidden();
  await expect(page.getByRole('searchbox', { name: 'Поиск по каталогу' })).toBeFocused();
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

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`keeps catalog search usable without overflow at ${String(width)}px`, async ({ page }) => {
    await page.setViewportSize({ height: 812, width });
    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Поиск по каталогу' }).click();

    const dialog = page.getByRole('dialog', { name: 'Поиск по каталогу' });
    const input = dialog.getByRole('searchbox', {
      name: 'Товар, категория или характеристика',
    });
    await input.fill('PE100');
    await expect(dialog.getByText('Труба ПНД PE100 питьевая')).toBeVisible();

    const bounds = await dialog.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? width)).toBeLessThanOrEqual(width);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);

    if (width <= 375) {
      expect(bounds?.width).toBe(width);
      expect(bounds?.height).toBe(812);
    }
  });
}
