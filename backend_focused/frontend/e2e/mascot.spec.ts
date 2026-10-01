import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const emptyPage = { count: 0, next: null, previous: null, results: [] };
const captureReview = process.env.MASCOT_CAPTURE === '1';

async function mockLists(page: Page) {
  await page.route('**/api/**', (route) => {
    const pathname = new URL(route.request().url()).pathname;
    return route.fulfill({
      json: pathname.endsWith('/summary/') || pathname.endsWith('/workload/') ? [] : emptyPage,
    });
  });
}

async function imageLoaded(image: Locator) {
  await expect(image).toHaveAttribute('alt', '');
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0),
    )
    .toBe(true);
}

async function capture(page: Page, name: string) {
  if (captureReview) {
    await page.screenshot({
      path: `test-results/mascot-review/${name}.png`,
      fullPage: true,
      animations: 'disabled',
      style: 'nextjs-portal { display: none; }',
    });
  }
}

async function dialogSettled(dialog: Locator) {
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('..')).toHaveCSS('opacity', '1');
}

test('reveals the decorative mascot on hover and keyboard focus while preserving all add dialogs', async ({
  page,
}) => {
  await mockLists(page);
  await page.goto('/vehicles');
  const headerMascot = page.getByRole('banner').getByTestId('fleet-mascot');
  await imageLoaded(headerMascot.locator('img'));
  await expect(headerMascot).toHaveAttribute('aria-hidden', 'true');
  const action = page.getByRole('button', { name: 'Add vehicle', exact: true });
  const peek = page.getByTestId('mascot-peek');
  await expect(action).toHaveJSProperty('tagName', 'BUTTON');
  await expect(peek).toHaveCSS('opacity', '0');
  await expect(peek).toHaveCSS('pointer-events', 'none');
  await imageLoaded(peek.locator('img'));
  await page.evaluate(() => document.fonts.ready);
  const buttonBounds = await action.boundingBox();
  const heading = page.getByRole('heading', { name: 'Vehicles', exact: true });
  const headingBounds = await heading.boundingBox();
  const hiddenY = await peek.evaluate(
    (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
  );
  await capture(page, 'desktop-normal');

  await action.hover();
  await expect(peek).toHaveCSS('opacity', '1');
  await expect
    .poll(() =>
      peek.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42),
    )
    .toBeLessThan(hiddenY);
  expect(await action.boundingBox()).toEqual(buttonBounds);
  expect(await heading.boundingBox()).toEqual(headingBounds);
  await capture(page, 'desktop-hover');
  await page.mouse.move(0, 0);
  await expect(peek).toHaveCSS('opacity', '0');

  for (let step = 0; step < 20; step += 1) {
    if (await action.evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(action).toBeFocused();
  await expect(peek).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  const vehicleDialog = page.getByRole('dialog', { name: 'Add vehicle', exact: true });
  await dialogSettled(vehicleDialog);
  await expect(
    vehicleDialog.getByRole('heading', { name: 'Add vehicle', exact: true }),
  ).toBeVisible();
  for (const name of ['Make', 'Model', 'Year', 'License plate', 'VIN', 'Office']) {
    await expect(vehicleDialog.getByLabel(name)).toHaveAttribute('required', '');
  }
  await imageLoaded(vehicleDialog.getByTestId('fleet-mascot').locator('img'));
  await capture(page, 'desktop-modal');
  await page.keyboard.press('Escape');
  await expect(vehicleDialog).toBeHidden();
  await expect(action).toBeFocused();

  const forms = [
    {
      path: '/offices',
      button: 'Add office',
      title: 'Add office',
      fields: ['Office name', 'City'],
    },
    {
      path: '/mechanics',
      button: 'Add mechanic',
      title: 'Add mechanic',
      fields: ['Name', 'Certification number'],
    },
    {
      path: '/maintenance',
      button: 'Add maintenance',
      title: 'Add maintenance record',
      fields: ['Vehicle', 'Mechanic', 'Maintenance date', 'Cost', 'Maintenance type'],
    },
  ];
  for (const form of forms) {
    await page.goto(form.path);
    const button = page
      .getByTestId('mascot-button')
      .getByRole('button', { name: form.button, exact: true });
    await button.click();
    const dialog = page.getByRole('dialog', { name: form.title, exact: true });
    await expect(dialog.getByRole('heading', { name: form.title, exact: true })).toBeVisible();
    for (const field of form.fields) {
      await expect(dialog.getByLabel(field)).toHaveAttribute('required', '');
    }
    await imageLoaded(dialog.getByTestId('fleet-mascot').locator('img'));
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  }
});

test.describe('touch devices', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('keeps the mascot decorative and opens the form without horizontal overflow', async ({
    page,
  }) => {
    await mockLists(page);
    await page.goto('/vehicles');
    await imageLoaded(page.getByRole('banner').getByTestId('fleet-mascot').locator('img'));
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await expect(page.getByTestId('mascot-peek')).toHaveCSS('opacity', '0');
    await page.getByRole('button', { name: 'Add vehicle', exact: true }).tap();
    const dialog = page.getByRole('dialog', { name: 'Add vehicle', exact: true });
    await dialogSettled(dialog);
    await expect(page.getByTestId('mascot-peek')).toHaveCSS('opacity', '0');
    await imageLoaded(dialog.getByTestId('fleet-mascot').locator('img'));
    await expect(dialog.getByRole('textbox', { name: 'Make', exact: true })).toBeEditable();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await capture(page, 'mobile-modal');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).tap();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('mascot-peek')).toHaveCSS('opacity', '0');
  });
});

test('respects reduced-motion preferences without disabling the add action', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockLists(page);
  await page.goto('/vehicles');
  const action = page.getByRole('button', { name: 'Add vehicle', exact: true });
  const peek = page.getByTestId('mascot-peek');
  await action.hover();
  await expect(peek).toHaveCSS('opacity', '1');
  await expect(peek).toHaveCSS('transition-duration', '0s');
  await action.click();
  await expect(page.getByRole('dialog', { name: 'Add vehicle', exact: true })).toBeVisible();
});
