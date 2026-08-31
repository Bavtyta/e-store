import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('desktop catalog mega menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await page.goto('/');
  });

  test('keeps category links in the DOM while the disclosure is closed', async ({ page }) => {
    const panel = page.locator('[aria-label="Каталог товаров"]').filter({ has: page.locator('a') });

    await expect(panel).toBeHidden();
    await expect(page.locator('header a[href="/catalog/truby/pnd"]')).toHaveCount(1);
  });

  test('opens as an attached disclosure and closes on repeated click and Escape', async ({
    page,
  }) => {
    const header = page.locator('header');
    const trigger = page
      .getByRole('navigation', { name: 'Основная навигация' })
      .getByRole('button', { name: 'Каталог' });
    const headerHeight = await header.evaluate((element) => element.clientHeight);

    await trigger.click();

    const catalogNavigation = page.getByRole('navigation', { name: 'Каталог товаров' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(catalogNavigation).toBeVisible();
    await expect(catalogNavigation.getByRole('link', { name: 'Трубы', exact: true })).toBeVisible();
    await expect(catalogNavigation.getByRole('link', { name: 'ПНД', exact: true })).toBeVisible();
    for (const categoryName of [
      'Трубы',
      'Фитинги и соединения',
      'Резинотехнические изделия',
      'Камеры',
      'Сопутствующие товары',
    ]) {
      const categoryLink = catalogNavigation.getByRole('link', {
        exact: true,
        name: categoryName,
      });
      await expect(categoryLink.locator('svg').first()).toHaveAttribute('width', '18');
      await expect(categoryLink.locator('svg')).toHaveCount(2);
    }
    const allCatalogLink = page.getByRole('link', { name: 'Смотреть весь каталог' });
    await expect(allCatalogLink.locator('svg')).toHaveCount(2);
    await expect(allCatalogLink).toHaveCSS('background-color', 'rgb(241, 243, 255)');
    const actionPosition = await allCatalogLink.evaluate((link) => {
      const linkBounds = link.getBoundingClientRect();
      const contentBounds = link.closest('section')?.getBoundingClientRect();
      return {
        bottomGap: (contentBounds?.bottom ?? 0) - linkBounds.bottom,
        rightGap: (contentBounds?.right ?? 0) - linkBounds.right,
      };
    });
    expect(actionPosition.bottomGap).toBeLessThanOrEqual(16);
    expect(actionPosition.rightGap).toBeLessThanOrEqual(16);
    expect(await header.evaluate((element) => element.clientHeight)).toBe(headerHeight);

    const panelTop = await catalogNavigation.evaluate(
      (element) => element.closest('[id]')?.getBoundingClientRect().top ?? -1,
    );
    const headerBottom = await header.evaluate((element) => element.getBoundingClientRect().bottom);
    expect(Math.abs(panelTop - headerBottom)).toBeLessThanOrEqual(1);

    await trigger.click();
    await expect(catalogNavigation).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(catalogNavigation).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('closes outside, on navigation and when search opens', async ({ page }) => {
    const trigger = page
      .getByRole('navigation', { name: 'Основная навигация' })
      .getByRole('button', { name: 'Каталог' });

    await trigger.click();
    await page.mouse.click(12, 850);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await page.getByRole('searchbox', { name: 'Поиск по каталогу' }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('dialog', { name: 'Поиск по каталогу' })).toBeVisible();

    await page.keyboard.press('Escape');
    await trigger.click();
    await page
      .getByRole('navigation', { name: 'Каталог товаров' })
      .getByRole('link', { name: 'ПНД', exact: true })
      .click();
    await expect(page).toHaveURL(/\/catalog\/truby\/pnd$/);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens on mouse hover and switches category content without changing panel size', async ({
    page,
  }) => {
    const trigger = page
      .getByRole('navigation', { name: 'Основная навигация' })
      .getByRole('button', { name: 'Каталог' });
    await trigger.hover();

    const catalogNavigation = page.getByRole('navigation', { name: 'Каталог товаров' });
    await expect(catalogNavigation).toBeVisible();
    const initialBounds = await catalogNavigation.boundingBox();

    await catalogNavigation.getByRole('link', { name: 'Фитинги и соединения' }).hover();
    await expect(
      catalogNavigation.getByRole('heading', { name: 'Фитинги и соединения' }),
    ).toBeVisible();
    await expect(catalogNavigation.getByRole('link', { name: 'Муфты' })).toBeVisible();
    const nextBounds = await catalogNavigation.boundingBox();

    expect(nextBounds?.width).toBe(initialBounds?.width);
    expect(nextBounds?.height).toBe(initialBounds?.height);
  });

  test('supports directional keyboard navigation without misusing current-page semantics', async ({
    page,
  }) => {
    const trigger = page
      .getByRole('navigation', { name: 'Основная навигация' })
      .getByRole('button', { name: 'Каталог' });
    await trigger.click();

    const catalogNavigation = page.getByRole('navigation', { name: 'Каталог товаров' });
    const pipesLink = catalogNavigation.getByRole('link', { name: 'Трубы', exact: true });
    const fittingsLink = catalogNavigation.getByRole('link', {
      name: 'Фитинги и соединения',
      exact: true,
    });

    await pipesLink.focus();
    await expect(pipesLink).not.toHaveAttribute('aria-current');
    await page.keyboard.press('ArrowDown');
    await expect(fittingsLink).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(
      catalogNavigation.getByRole('link', { name: 'Все товары: Фитинги и соединения' }),
    ).toBeFocused();
  });

  for (const width of [1280, 1440, 1920]) {
    test(`keeps the desktop catalog compact at ${String(width)}px`, async ({ page }) => {
      await page.setViewportSize({ height: 900, width });
      await page.reload();
      await page
        .getByRole('navigation', { name: 'Основная навигация' })
        .getByRole('button', { name: 'Каталог' })
        .hover();

      const catalogNavigation = page.getByRole('navigation', { name: 'Каталог товаров' });
      const geometry = await catalogNavigation.evaluate((navigation) => {
        const panel = navigation.closest('[id]');
        const rootList = navigation.querySelector('ul');
        const childLink = navigation.querySelector('section li a');
        return {
          childWidth: childLink?.getBoundingClientRect().width ?? 0,
          height: panel?.getBoundingClientRect().height ?? 0,
          leftWidth: rootList?.getBoundingClientRect().width ?? 0,
          panelWidth: panel?.getBoundingClientRect().width ?? 0,
        };
      });

      expect(geometry.panelWidth).toBeLessThanOrEqual(896);
      expect(geometry.leftWidth).toBeLessThanOrEqual(216);
      expect(geometry.childWidth).toBeLessThan(230);
      expect(geometry.height).toBeLessThan(280);
    });
  }
});

for (const width of [320, 375, 768, 1024]) {
  test(`uses the nested catalog screen without overflow at ${String(width)}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 812, width });
    await page.goto('/');

    const opener = page.getByRole('button', { name: 'Открыть меню' });
    await opener.click();
    const drawer = page.getByRole('dialog', { name: 'BELT' });
    const catalogTrigger = drawer.getByRole('button', { name: 'Каталог' });

    await catalogTrigger.click();
    const catalogNavigation = drawer.getByRole('navigation', { name: 'Каталог товаров' });
    await expect(catalogNavigation).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Назад' })).toBeFocused();
    await catalogNavigation.getByRole('button', { name: 'Трубы' }).click();
    await expect(catalogNavigation.getByRole('link', { name: 'ПНД', exact: true })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);

    await page.keyboard.press('Escape');
    await expect(catalogNavigation.getByRole('button', { name: 'Трубы' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(catalogNavigation).toBeHidden();
    await expect(drawer.getByRole('button', { name: 'Каталог' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();
  });
}

test('mobile category navigation closes the drawer', async ({ page }) => {
  await page.setViewportSize({ height: 812, width: 375 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Открыть меню' }).click();

  const drawer = page.getByRole('dialog', { name: 'BELT' });
  await drawer.getByRole('button', { name: 'Каталог' }).click();
  const catalogNavigation = drawer.getByRole('navigation', { name: 'Каталог товаров' });
  await catalogNavigation.getByRole('button', { name: 'Трубы' }).click();
  await catalogNavigation.getByRole('link', { name: 'ПНД', exact: true }).click();

  await expect(page).toHaveURL(/\/catalog\/truby\/pnd$/);
  await expect(drawer).toBeHidden();
});

test('catalog navigation states have no automatically detectable accessibility violations', async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Основная навигация' })
    .getByRole('button', { name: 'Каталог' })
    .click();

  const desktopResults = await new AxeBuilder({ page }).analyze();
  expect(desktopResults.violations).toEqual([]);

  await page.setViewportSize({ height: 812, width: 375 });
  await page.reload();
  await page.getByRole('button', { name: 'Открыть меню' }).click();
  const drawer = page.getByRole('dialog', { name: 'BELT' });
  await drawer.getByRole('button', { name: 'Каталог' }).click();

  const mobileResults = await new AxeBuilder({ page }).analyze();
  expect(mobileResults.violations).toEqual([]);
});
