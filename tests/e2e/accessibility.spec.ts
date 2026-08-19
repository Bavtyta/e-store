import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pagesToAudit = [
  {
    heading: 'Трубы, фитинги и РТИ для рабочих задач',
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
    heading: 'Корзина пуста',
    path: '/cart',
  },
  {
    heading: 'Контакты',
    path: '/contacts',
  },
  {
    heading: 'Избранное',
    path: '/favorites',
  },
  {
    heading: 'Вход',
    path: '/login',
  },
  {
    heading: 'Помощь с подбором',
    path: '/selection-help',
  },
  {
    heading: 'Услуги',
    path: '/services',
  },
  {
    heading: 'Акции и спецпредложения',
    path: '/offers',
  },
] as const;

for (const pageCase of pagesToAudit) {
  test(`has no axe violations on ${pageCase.path}`, async ({ page }) => {
    await page.goto(pageCase.path);
    await expect(page.getByRole('heading', { exact: true, name: pageCase.heading })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violationSummary = results.violations.map((violation) => ({
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
      impact: violation.impact,
    }));

    expect(
      results.violations,
      `axe violations on ${pageCase.path}: ${JSON.stringify(violationSummary, null, 2)}`,
    ).toEqual([]);
  });
}

test('has no axe violations in catalog search results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Поиск по каталогу' }).click();

  const dialog = page.getByRole('dialog', { name: 'Поиск по каталогу' });
  const input = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
  await input.fill('PE100');
  await expect(dialog.getByText('Труба ПНД PE100 питьевая')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
