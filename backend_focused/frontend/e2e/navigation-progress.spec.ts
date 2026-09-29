import type { Page } from '@playwright/test';
import type { Office } from '../lib/api/types';
import { apiURL, expect, test } from './fixtures';

async function mockLists(page: Page) {
  const offices: Office[] = Array.from({ length: 11 }, (_, index) => ({
    id: index + 1,
    name: `Office ${index + 1}`,
    city: 'Salvador',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }));
  await page.route('**/api/**', (route) => {
    expect(route.request().method()).toBe('GET');
    const url = new URL(route.request().url());
    const pageNumber = Number(url.searchParams.get('page') ?? 1);
    const results = url.pathname === '/api/offices/' ? offices : [];
    return route.fulfill({
      json: {
        count: results.length,
        next: results.length > pageNumber * 10 ? `${apiURL}/offices/?page=${pageNumber + 1}` : null,
        previous: null,
        results: results.slice((pageNumber - 1) * 10, pageNumber * 10),
      },
    });
  });
}

async function holdNavigation(page: Page, matches: (url: URL) => boolean) {
  let release: () => void = () => {};
  let requested = false;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.headers().rsc === '1' && matches(new URL(request.url()))) {
      requested = true;
      await pending;
      await route.continue();
    } else await route.fallback();
  });
  return { release, requested: () => requested };
}

async function expectFinished(page: Page) {
  await expect(page.locator('#nprogress')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/nprogress-busy/);
}

async function capture(page: Page, name: string) {
  if (process.env.NAV_CAPTURE === '1')
    await page.screenshot({
      path: `test-results/navigation-review/${name}.png`,
      fullPage: true,
      animations: 'disabled',
      style: 'nextjs-portal { display: none; }',
    });
}

test('shows the top bar during a Link navigation and finishes once the new route commits', async ({
  page,
}) => {
  await mockLists(page);
  await page.goto('/offices');
  await expect(page.getByText('1–10 of 11', { exact: true })).toBeVisible();
  const pending = await holdNavigation(page, (url) => url.pathname === '/mechanics');
  const navigating = page.getByRole('tab', { name: 'Mechanics', exact: true }).click();
  try {
    await expect.poll(pending.requested).toBe(true);
    const bar = page.locator('#nprogress .bar');
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS('position', 'fixed');
    await expect(bar).toHaveCSS('top', '0px');
    await expect(bar).toHaveCSS('height', '3px');
    await expect(page.locator('#nprogress')).toHaveCSS('pointer-events', 'none');
    await expect(page.locator('#nprogress .spinner')).toHaveCount(0);
    await capture(page, 'desktop-navigation');
  } finally {
    pending.release();
  }
  await navigating;
  await expect(page).toHaveURL('/mechanics');
  await expect(page.getByRole('heading', { name: 'Mechanics', exact: true })).toBeVisible();
  await expectFinished(page);
});

test('tracks programmatic pagination and does not leave a loader on repeated queries, same-page links or hashes', async ({
  page,
}) => {
  await page.clock.install();
  await mockLists(page);
  await page.goto('/offices');
  const pagination = page.getByTestId('list-pagination');
  await expect(pagination.getByText('1–10 of 11', { exact: true })).toBeVisible();
  const pending = await holdNavigation(
    page,
    (url) => url.pathname === '/offices' && url.searchParams.get('page') === '2',
  );
  const navigating = pagination
    .getByRole('button', { name: 'Go to next page', exact: true })
    .click();
  try {
    await expect.poll(pending.requested).toBe(true);
    await expect(page.locator('#nprogress .bar')).toBeVisible();
  } finally {
    pending.release();
  }
  await navigating;
  await expect(page).toHaveURL('/offices?page=2');
  await expect(pagination.getByText('11–11 of 11', { exact: true })).toBeVisible();
  await expectFinished(page);

  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('Office');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page).toHaveURL('/offices?search=Office');
  await expectFinished(page);
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await page.clock.runFor(1_000);
  await expectFinished(page);
  await page.getByRole('tab', { name: 'Offices', exact: true }).click();
  await expect(page).toHaveURL('/offices');
  await expectFinished(page);
  await page.getByRole('tab', { name: 'Offices', exact: true }).click();
  await page.clock.runFor(1_000);
  await expectFinished(page);
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/offices#main-content');
  await page.clock.runFor(1_000);
  await expectFinished(page);
});

test('keeps the mobile progress bar static with reduced motion and still completes navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await mockLists(page);
  await page.goto('/offices');
  await expect(page.getByText('1–10 of 11', { exact: true })).toBeVisible();
  const pending = await holdNavigation(page, (url) => url.pathname === '/mechanics');
  await page.getByRole('combobox', { name: /^Section\b/ }).click();
  const navigating = page.getByRole('option', { name: 'Mechanics', exact: true }).click();
  try {
    await expect.poll(pending.requested).toBe(true);
    const bar = page.locator('#nprogress .bar');
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS('transition-duration', '0s');
    await page.clock.runFor(1);
    const transform = await bar.evaluate((element) => getComputedStyle(element).transform);
    await page.clock.runFor(1_200);
    await expect(bar).toHaveCSS('transform', transform);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await capture(page, 'mobile-navigation');
  } finally {
    pending.release();
  }
  await navigating;
  await expect(page).toHaveURL('/mechanics');
  await expectFinished(page);
});
