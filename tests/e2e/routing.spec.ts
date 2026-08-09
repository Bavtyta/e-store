import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const responsiveViewports = [320, 375, 768, 1024, 1440] as const;

const responsivePages = [
  {
    heading: 'Строительные материалы для профессионалов',
    path: '/',
  },
  {
    heading: 'Каталог товаров',
    path: '/catalog',
  },
  {
    heading: 'ПНД',
    path: '/catalog/truby/pnd',
  },
  {
    heading: 'Труба ПНД PE100 питьевая',
    path: '/product/truba-pnd-pe100-pitevaya',
  },
  {
    heading: 'Корзина',
    path: '/cart',
  },
] as const;

async function seedCart(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      'storefront-cart-v1',
      JSON.stringify({
        state: {
          items: [
            {
              addedAt: '2026-07-30T12:00:00.000Z',
              quantity: '2',
              variantId: 'product-001-variant-25',
            },
          ],
        },
        version: 1,
      }),
    );
  });
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
}

async function expectMetadataTag(
  page: Page,
  selector: string,
  attribute: string,
  expectedValue: string | RegExp,
): Promise<void> {
  const element = page.locator(selector);

  await expect(element).toHaveCount(1);
  await expect(element).toHaveAttribute(attribute, expectedValue);
}

test('opens a product from the catalog, changes its variant and handles 404', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Строительные материалы для профессионалов' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Каталог' }).first().click();
  await expect(page.getByRole('heading', { name: 'Каталог товаров' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();

  await page.getByLabel('Поиск товаров').fill('ПВХ');
  await expect(page.getByRole('heading', { name: /ПВХ/i }).first()).toBeVisible();

  await page.getByLabel('Сортировка').selectOption('name_asc');
  await expect(page).toHaveURL(/sort=name_asc/);

  await page.goto('/catalog/truby/pnd');
  await expect(page.getByRole('heading', { exact: true, name: 'ПНД' })).toBeVisible();

  await page
    .getByRole('link', {
      name: 'Открыть товар «Труба ПНД PE100 питьевая»',
    })
    .click();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Труба ПНД PE100 питьевая',
    }),
  ).toBeVisible();
  await expect(page.getByText('SKU-PRODUCT-001-20', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Цена').getByText(/89,00/)).toBeVisible();
  const mainImage = page.getByRole('img', {
    name: 'Труба ПНД PE100 питьевая, изображение 1',
  });
  await expect(mainImage).toBeVisible();
  await expect
    .poll(() => mainImage.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.getByRole('link', { exact: true, name: 'ПНД' })).toHaveAttribute(
    'href',
    '/catalog/truby/pnd',
  );

  await page.getByText('25 мм', { exact: true }).click();

  await expect(page.getByText('SKU-PRODUCT-001-25', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Цена').getByText(/125,00/)).toBeVisible();

  await page.goto('/product/ne-sushchestvuet');
  await expect(page.getByRole('heading', { name: 'Товар не найден' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Вернуться в каталог' })).toBeVisible();
});

test('keeps the product page responsive and supports keyboard variant selection', async ({
  page,
}) => {
  await page.setViewportSize({ height: 800, width: 320 });
  await page.goto('/product/truba-pnd-pe100-pitevaya');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Труба ПНД PE100 питьевая',
    }),
  ).toBeVisible();

  await expectNoHorizontalOverflow(page);

  const initialVariant = page.getByRole('radio', { name: '20 мм' });
  const nextVariant = page.getByRole('radio', { name: '25 мм' });

  await initialVariant.focus();
  await expect(initialVariant).toBeFocused();
  await page.keyboard.press('ArrowRight');

  await expect(nextVariant).toBeChecked();
  await expect(nextVariant).toBeFocused();
  await expect(page.getByText('SKU-PRODUCT-001-25', { exact: true })).toBeVisible();
});

test('adds a variant, changes quantity and restores the cart after reload', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 320 });
  await page.goto('/catalog/truby/pnd');

  await page
    .getByRole('link', {
      name: 'Открыть товар «Труба ПНД PE100 питьевая»',
    })
    .click();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Труба ПНД PE100 питьевая',
    }),
  ).toBeVisible();

  await page.getByText('25 мм', { exact: true }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();

  await expect(page.getByText('Товар добавлен в корзину')).toBeVisible();
  await expect(page.getByLabel('В корзине позиций: 1')).toBeVisible();
  const resolveResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/v1/catalog/variants/resolve'),
  );
  await page.getByRole('link', { name: /Корзина/ }).click();
  const resolveResponse = await resolveResponsePromise;

  expect(resolveResponse.status()).toBe(200);

  const quantityInput = page.getByRole('spinbutton', {
    name: 'Количество «Труба ПНД PE100 питьевая»',
  });

  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Труба ПНД PE100 питьевая',
    }),
  ).toBeVisible();
  await expect(quantityInput).toHaveValue('1');

  await quantityInput.focus();
  await page.keyboard.press('ArrowUp');

  await expect(quantityInput).toHaveValue('2');
  await expect(page.getByText(/250,00/).last()).toBeVisible();
  await expect(
    page.getByRole('status').filter({
      hasText: 'Количество «Труба ПНД PE100 питьевая»: 2 шт.',
    }),
  ).toBeAttached();

  const storedCart = await page.evaluate(() => localStorage.getItem('storefront-cart-v1'));

  expect(storedCart).toContain('"variantId":"product-001-variant-25"');
  expect(storedCart).toContain('"quantity":"2"');
  expect(storedCart).toContain('"addedAt":');
  expect(storedCart).not.toContain('"price"');
  expect(storedCart).not.toContain('"name"');
  expect(storedCart).not.toContain('"sku"');

  await page.reload();

  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Труба ПНД PE100 питьевая',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('spinbutton', {
      name: 'Количество «Труба ПНД PE100 питьевая»',
    }),
  ).toHaveValue('2');
  await expect(page.getByText(/250,00/).last()).toBeVisible();

  await expectNoHorizontalOverflow(page);
});

test('opens the development UI preview and keeps dialog focus contained', async ({ page }) => {
  await page.setViewportSize({ height: 800, width: 320 });
  await page.goto('/ui-preview');

  await expect(page.getByRole('heading', { name: 'UI Preview' })).toBeVisible();

  await expectNoHorizontalOverflow(page);

  const opener = page.getByRole('button', { name: 'Открыть диалог' });
  await opener.click();

  const dialog = page.getByRole('dialog', { name: 'Проверка диалога' });
  const closeButton = page.getByRole('button', { name: 'Закрыть диалог' });
  const confirmButton = page.getByRole('button', { name: 'Подтвердить' });

  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(confirmButton).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('applies indexable metadata to public storefront pages', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Строительные материалы для профессионалов' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('BELT | Строительные материалы для профессионалов — ПромМатериалы');
  await expectMetadataTag(page, 'link[rel="canonical"]', 'href', 'http://127.0.0.1:4173/');
  await expectMetadataTag(page, 'meta[name="robots"]', 'content', 'index, follow');

  await page.goto('/catalog/truby/pnd');
  await expect(page.getByRole('heading', { level: 1, name: 'ПНД' })).toBeVisible();
  await expect(page).toHaveTitle('ПНД — ПромМатериалы');
  await expectMetadataTag(
    page,
    'link[rel="canonical"]',
    'href',
    'http://127.0.0.1:4173/catalog/truby/pnd',
  );

  await page.goto('/product/truba-pnd-pe100-pitevaya');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Труба ПНД PE100 питьевая',
    }),
  ).toBeVisible();
  await expect(page).toHaveTitle('Труба ПНД PE100 питьевая — ПромМатериалы');
  await expectMetadataTag(page, 'meta[property="og:type"]', 'content', 'product');
  await expectMetadataTag(
    page,
    'meta[property="og:image"]',
    'content',
    /^http:\/\/127\.0\.0\.1:4173\/fixtures\/products\/.+\.webp$/,
  );
  await expectMetadataTag(page, 'meta[name="twitter:card"]', 'content', 'summary_large_image');
});

test('marks cart, service and not-found pages as non-indexable', async ({ page }) => {
  const nonIndexablePages = [
    {
      heading: 'Корзина пуста',
      path: '/cart',
    },
    {
      heading: 'Контакты',
      path: '/contacts',
    },
    {
      heading: 'Товар не найден',
      path: '/product/ne-sushchestvuet',
    },
    {
      heading: 'Категория не найдена',
      path: '/catalog/ne-sushchestvuet',
    },
    {
      heading: 'Страница не найдена',
      path: '/neizvestnyy-adres',
    },
  ] as const;

  for (const pageCase of nonIndexablePages) {
    await page.goto(pageCase.path);
    await expect(page.getByRole('heading', { name: pageCase.heading })).toBeVisible();
    await expectMetadataTag(page, 'meta[name="robots"]', 'content', 'noindex, nofollow');
    await expect(page.locator('head title')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  }
});

test('supports skip navigation and keyboard gallery controls', async ({ page }) => {
  await page.goto('/product/truba-pnd-pe100-pitevaya');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Труба ПНД PE100 питьевая',
    }),
  ).toBeVisible();

  const skipLink = page.getByRole('link', {
    name: 'Перейти к основному содержимому',
  });

  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  const secondThumbnail = page.getByRole('button', {
    name: /Показать изображение 2/,
  });

  await secondThumbnail.focus();
  await page.keyboard.press('Enter');
  await expect(secondThumbnail).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('img', {
      name: 'Труба ПНД PE100 питьевая, изображение 2',
    }),
  ).toBeVisible();
});

for (const viewportWidth of responsiveViewports) {
  test(`keeps key pages semantic and free of horizontal overflow at ${String(viewportWidth)}px`, async ({
    page,
  }) => {
    await page.setViewportSize({
      height: 900,
      width: viewportWidth,
    });
    await seedCart(page);

    for (const pageCase of responsivePages) {
      await page.goto(pageCase.path);
      await expect(
        page.getByRole('heading', {
          exact: true,
          level: 1,
          name: pageCase.heading,
        }),
      ).toBeVisible();
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('img:not([alt])')).toHaveCount(0);
      await expectNoHorizontalOverflow(page);
    }
  });
}
