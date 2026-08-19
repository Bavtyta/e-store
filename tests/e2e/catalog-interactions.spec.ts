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

  const searchInput = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  await expect(page.getByRole('searchbox')).toHaveCount(1);

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
  const searchInput = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  await expect(page.getByRole('searchbox')).toHaveCount(1);

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

test('closes attached catalog search from the backdrop and restores focus', async ({ page }) => {
  await page.goto('/');

  const searchInput = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  await searchInput.click();

  await expect(page.getByRole('dialog', { name: 'Поиск по каталогу' })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть поиск' }).click();

  await expect(page.getByRole('dialog', { name: 'Поиск по каталогу' })).toBeHidden();
  await expect(searchInput).toBeFocused();
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

// 720px also covers the effective CSS viewport of a 1440px screen at 200% zoom.
for (const width of [320, 375, 720, 768, 1024, 1440]) {
  test(`keeps catalog search usable without overflow at ${String(width)}px`, async ({ page }) => {
    await page.setViewportSize({ height: 812, width });
    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Поиск по каталогу' }).click();

    const dialog = page.getByRole('dialog', { name: 'Поиск по каталогу' });
    const input = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
    await expect(page.getByRole('searchbox')).toHaveCount(1);
    await input.fill('PE100');
    await expect(dialog.getByText('Труба ПНД PE100 питьевая')).toBeVisible();

    const bounds = await dialog.boundingBox();
    const inputBounds = await input.boundingBox();
    expect(bounds).not.toBeNull();
    expect(inputBounds).not.toBeNull();
    expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? width)).toBeLessThanOrEqual(width);

    if (width >= 768) {
      expect(Math.abs((bounds?.x ?? 0) - (inputBounds?.x ?? 0))).toBeLessThanOrEqual(2);
      expect(
        Math.abs(
          (bounds?.y ?? 0) - (inputBounds === null ? 0 : inputBounds.y + inputBounds.height),
        ),
      ).toBeLessThanOrEqual(2);
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);

    if (width <= 375) {
      expect(bounds?.width).toBe(width);
      expect(bounds?.y ?? 0).toBeGreaterThan(0);
      expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(812);
    }
  });
}
