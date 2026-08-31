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
  await expect(
    page
      .getByRole('dialog', { name: 'Поиск по каталогу' })
      .getByText('Труба ПВХ канализационная 110 мм'),
  ).toBeVisible();
  await searchInput.press('Enter');

  await expect(page).toHaveURL(/\/catalog\?filter%5Bmaterial%5D=/);
  await expect(page.getByRole('heading', { name: 'Каталог товаров' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Поиск по каталогу' })).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Убрать фильтр: Материал: ПВХ' })).toBeVisible();
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

test('keeps search shell geometry stable when the clear action appears', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1024 });
  await page.goto('/');

  const input = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  const submit = page.getByRole('button', { name: 'Найти' });
  await input.click();

  const emptyInputBounds = await input.boundingBox();
  const emptySubmitBounds = await submit.boundingBox();
  await input.fill('очень длинный поисковый запрос для проверки геометрии поля');
  await expect(page.getByRole('button', { name: 'Очистить поиск' })).toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'Поиск по каталогу' }).getByRole('status'),
  ).toContainText('Ищем товары');

  expect(await input.boundingBox()).toEqual(emptyInputBounds);
  expect(await submit.boundingBox()).toEqual(emptySubmitBounds);

  await page.getByRole('button', { name: 'Очистить поиск' }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
});

test('renders the inline search icon and resolves yellow interactive tokens', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto('/');

  const input = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  const submit = page.getByRole('button', { name: 'Найти' });
  const searchShell = input.locator('..');

  await expect(searchShell.locator('svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(submit).toHaveCSS('background-color', 'rgb(250, 204, 21)');

  await submit.hover();
  await expect(submit).toHaveCSS('background-color', 'rgb(238, 194, 0)');

  await input.focus();
  await expect(searchShell).toHaveCSS('border-color', 'rgb(250, 204, 21)');
});

test('filters the catalog live by material and diameter and resets filters', async ({ page }) => {
  await openCatalog(page);

  const material = page.getByRole('checkbox', { name: /^ПВХ/ });
  const diameter = page.getByRole('checkbox', { name: /^110/ });
  await material.click();
  await expect(material).toBeChecked();
  await diameter.click();
  await expect(diameter).toBeChecked();

  await expect
    .poll(() => decodeURIComponent(page.url()))
    .toContain('/catalog?filter[material]=ПВХ');
  await expect(page).toHaveURL(/filter%5Bdiameter%5D=110/);
  await expect(page.getByText('Труба ПВХ канализационная 110 мм')).toBeVisible();
  await expect(page.getByText('Труба ПНД PE100 питьевая')).toBeHidden();

  await page.getByRole('button', { name: 'Сбросить фильтры' }).click();

  await expect(page.getByText('Труба ПНД PE100 питьевая')).toBeVisible();
  await expect(material).not.toBeChecked();
  await expect(diameter).not.toBeChecked();
});

test('requires variant selection for a multi-SKU product', async ({ page }) => {
  await openCatalog(page);

  const productCard = page
    .getByRole('heading', { name: 'Труба ПНД PE100 питьевая' })
    .locator('..')
    .locator('..');
  await productCard.getByRole('link', { name: 'Выбрать вариант' }).click();

  await expect(page).toHaveURL(/\/product\/truba-pnd-pe100-pitevaya$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Труба ПНД PE100 питьевая' }),
  ).toBeVisible();
});

test('adds a specific single-SKU product directly from its card', async ({ page }) => {
  await openCatalog(page);

  const productCard = page
    .getByRole('heading', { name: 'Труба ПВХ канализационная 110 мм' })
    .locator('..')
    .locator('..');
  await productCard.getByRole('button', { name: 'В корзину' }).click();

  await expect(page.getByRole('banner').getByLabel('В корзине позиций: 1')).toBeVisible();
});

test('adds a packaged product using the package quantity', async ({ page }) => {
  await page.goto('/catalog?search=Хомут');
  await expect(page.getByRole('heading', { name: 'Хомут червячный нержавеющий' })).toBeVisible();
  const priceBlock = page.getByLabel('Цена и условия покупки');
  await expect(priceBlock.getByText(/650,00/)).toBeVisible();
  await expect(priceBlock.getByText('за упаковку')).toBeVisible();
  await expect(
    priceBlock.getByText(/В упаковке:\s*10\s*шт\.[\s\S]*65,00[\s\S]*за\s*1\s*шт\./),
  ).toBeVisible();

  await page.getByRole('button', { name: 'В корзину' }).click();
  await page.getByRole('banner').getByLabel('В корзине позиций: 1').click();

  await expect(
    page.getByRole('spinbutton', { name: 'Количество «Хомут червячный нержавеющий»' }),
  ).toHaveValue('10');
});

test('keeps mobile filter drafts private until apply and keeps the footer visible', async ({
  page,
}) => {
  await page.setViewportSize({ height: 812, width: 375 });
  await openCatalog(page);

  await page.getByRole('button', { name: 'Фильтры и сортировка' }).click();
  const dialog = page.getByRole('dialog', { name: 'Фильтры и сортировка' });
  const material = dialog.getByRole('checkbox', { name: /^ПВХ/ });
  const apply = dialog.getByRole('button', { name: /^Показать/ });
  await material.click();

  await expect(page).not.toHaveURL(/filter%5Bmaterial%5D/);
  const applyBounds = await apply.boundingBox();
  expect(applyBounds).not.toBeNull();
  expect((applyBounds?.y ?? 812) + (applyBounds?.height ?? 0)).toBeLessThanOrEqual(812);

  await dialog.getByRole('button', { name: 'Закрыть фильтры' }).click();
  await expect(page).not.toHaveURL(/filter%5Bmaterial%5D/);

  await page.getByRole('button', { name: 'Фильтры и сортировка' }).click();
  const reopenedDialog = page.getByRole('dialog', { name: 'Фильтры и сортировка' });
  await reopenedDialog.getByRole('checkbox', { name: /^ПВХ/ }).click();
  await reopenedDialog.getByRole('button', { name: /^Показать/ }).click();

  await expect(page).toHaveURL(/filter%5Bmaterial%5D=%D0%9F%D0%92%D0%A5/);
});

test('emits privacy-safe catalog analytics without the raw query', async ({ page }) => {
  await page.addInitScript(() => {
    const capturedEvents: unknown[] = [];
    const analyticsWindow = window as Window & { __storefrontAnalyticsEvents?: unknown[] };
    analyticsWindow.__storefrontAnalyticsEvents = capturedEvents;
    window.addEventListener('storefront:analytics', (event) => {
      if (event instanceof CustomEvent) {
        capturedEvents.push((event as CustomEvent<unknown>).detail);
      }
    });
  });
  await openCatalog(page);

  const catalogSearch = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  await catalogSearch.fill('секретный запрос клиента');
  await catalogSearch.press('Enter');
  await expect(page.getByRole('heading', { name: 'По запросу ничего не найдено' })).toBeVisible();

  const serializedEvents = await page.evaluate(() =>
    JSON.stringify(
      (window as Window & { __storefrontAnalyticsEvents?: unknown[] })
        .__storefrontAnalyticsEvents ?? [],
    ),
  );
  expect(serializedEvents).toContain('catalog_search_submitted');
  expect(serializedEvents).toContain('catalog_results_viewed');
  expect(serializedEvents).not.toContain('секретный запрос клиента');
});

test('keeps primary navigation labels accessible with decorative outline icons', async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Основная навигация' });
  const headerHeight = await page.locator('header').evaluate((header) => header.clientHeight);

  for (const item of [
    { label: 'Услуги', path: '/services' },
    { label: 'Доставка', path: '/delivery' },
    { label: 'Контакты', path: '/contacts' },
  ]) {
    const link = navigation.getByRole('link', { name: item.label });
    await expect(link).toHaveAttribute('href', item.path);
    await expect(link.locator('svg[aria-hidden="true"]')).toHaveCount(1);
    await expect(link.locator('svg')).toHaveAttribute('fill', 'none');
    await expect(link.locator('svg')).toHaveAttribute('stroke', 'currentColor');
    await expect(link.locator('svg')).toHaveAttribute('width', '18');
    expect(
      await link.evaluate((element) => element.scrollHeight <= element.clientHeight),
    ).toBeTruthy();
  }

  const catalogButton = navigation.getByRole('button', { name: 'Каталог' });
  await expect(catalogButton.locator('svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(catalogButton.locator('svg')).toHaveAttribute('stroke', 'currentColor');
  await expect(catalogButton.locator('svg')).toHaveAttribute('width', '18');
  await catalogButton.focus();
  await expect(catalogButton).toBeFocused();
  expect(
    await catalogButton.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).not.toBe('none');
  await catalogButton.hover();
  await expect(catalogButton).toHaveCSS('color', 'rgb(20, 27, 43)');
  await expect(catalogButton).toHaveCSS('background-color', 'rgb(241, 243, 255)');
  await catalogButton.click();
  await expect(catalogButton).toHaveAttribute('aria-expanded', 'true');
  await expect(catalogButton).toHaveCSS('border-bottom-color', 'rgb(250, 204, 21)');
  expect(await page.locator('header').evaluate((header) => header.clientHeight)).toBe(headerHeight);

  await page.goto('/catalog');
  const activeCatalogButton = page
    .getByRole('navigation', { name: 'Основная навигация' })
    .getByRole('button', { name: 'Каталог' });
  expect(
    await activeCatalogButton.evaluate((element) => getComputedStyle(element).borderBottomColor),
  ).toBe('rgb(250, 204, 21)');
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
  await expect(dialog.getByRole('button', { name: 'Каталог' }).locator('svg')).toHaveCount(2);

  await page.keyboard.press('Shift+Tab');
  await expect(cartLink).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
});

for (const { columns, width } of [
  { columns: 1, width: 320 },
  { columns: 1, width: 375 },
  { columns: 2, width: 512 },
  { columns: 2, width: 768 },
  { columns: 3, width: 1024 },
  { columns: 4, width: 1440 },
]) {
  test(`renders ${String(columns)} usable catalog columns at ${String(width)}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width });
    await openCatalog(page);

    const cardBounds = await page
      .getByRole('region', { name: 'Товары каталога' })
      .locator('h3')
      .evaluateAll((headings) =>
        headings.slice(0, 4).map((heading) => {
          const card = heading.parentElement?.parentElement;
          const bounds = card?.getBoundingClientRect();

          return bounds === undefined
            ? null
            : { height: bounds.height, width: bounds.width, x: bounds.x, y: bounds.y };
        }),
      );
    const visibleBounds = cardBounds.filter((bounds) => bounds !== null);
    const firstRowY = visibleBounds[0]?.y;
    const firstRow = visibleBounds.filter(
      (bounds) => firstRowY !== undefined && Math.abs(bounds.y - firstRowY) <= 2,
    );

    expect(firstRow).toHaveLength(columns);
    expect(Math.min(...firstRow.map((bounds) => bounds.width))).toBeGreaterThanOrEqual(200);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);

    if (width < 1024) {
      await expect(page.getByRole('button', { name: 'Фильтры и сортировка' })).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: 'Категории' })).toBeVisible();
    }
  });
}

test('uses the existing menu pattern for navigation at 1024px', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1024 });
  await page.goto('/');

  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toBeHidden();
  const opener = page.getByRole('button', { name: 'Открыть меню' });
  await expect(opener).toBeVisible();
  await opener.click();

  const dialog = page.getByRole('dialog', { name: 'BELT' });
  await expect(dialog.getByRole('button', { name: 'Каталог' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Контакты' })).toBeVisible();
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
