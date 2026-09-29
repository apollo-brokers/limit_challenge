import type { Page } from '@playwright/test';
import type { MechanicWorkload } from '../lib/api/types';
import { expect, test } from './fixtures';

const sections = ['Vehicles', 'Offices', 'Mechanics', 'Maintenance'];

async function mockLists(page: Page) {
  const workload: MechanicWorkload[] = [
    { name: 'Ana Martins', maintenance_count: 5, total_maintenance_cost: '320.00' },
    { name: 'Bruno Costa', maintenance_count: 3, total_maintenance_cost: '180.00' },
  ];
  await page.route('**/api/**', (route) => {
    expect(route.request().method()).toBe('GET');
    const pathname = new URL(route.request().url()).pathname;
    return route.fulfill({
      json: pathname.endsWith('/workload/')
        ? workload
        : pathname.endsWith('/summary/')
          ? []
          : { count: 0, next: null, previous: null, results: [] },
    });
  });
}

async function expectView(page: Page, section: string, view: string) {
  await expect(page.getByRole('heading', { name: section, exact: true })).toBeVisible();
  const views = page.getByRole('tablist', { name: `${section} views`, exact: true });
  await expect(views.getByRole('tab', { selected: true })).toHaveCount(1);
  const active = views.getByRole('tab', { name: view, exact: true });
  await expect(active).toHaveAttribute('aria-selected', 'true');
  await expect(active).toHaveAttribute('aria-current', 'page');
}

async function capture(page: Page, name: string) {
  if (process.env.GROUPED_CAPTURE === '1')
    await page.screenshot({
      path: `test-results/grouped-navigation-review/${name}.png`,
      fullPage: true,
      animations: 'disabled',
      style: 'nextjs-portal { display: none; }',
    });
}

test('keeps four primary sections and restores local views through links, reload and history', async ({
  page,
}) => {
  await mockLists(page);
  await page.goto('/vehicles/needing-maintenance');
  const navigation = page.getByRole('tablist', { name: 'Main navigation', exact: true });
  await expect(navigation.getByRole('tab')).toHaveText(sections);
  await expect(navigation.getByRole('tab', { selected: true })).toHaveCount(1);
  await expect(navigation.getByRole('tab', { name: 'Vehicles', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expectView(page, 'Vehicles', 'Needing maintenance');
  const allVehicles = page.getByRole('tab', { name: 'All vehicles', exact: true });
  await expect(allVehicles).toHaveAttribute('href', '/vehicles');
  await allVehicles.click();
  await expect(page).toHaveURL('/vehicles');
  await expectView(page, 'Vehicles', 'All vehicles');

  await navigation.getByRole('tab', { name: 'Offices', exact: true }).click();
  await expectView(page, 'Offices', 'All offices');
  const summary = page.getByRole('tab', { name: 'Fleet summary', exact: true });
  await expect(summary).toHaveAttribute('href', '/offices/summary');
  await summary.click();
  await expect(page).toHaveURL('/offices/summary');
  await expectView(page, 'Offices', 'Fleet summary');
  await expect(navigation.getByRole('tab', { name: 'Offices', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await page.reload();
  await expectView(page, 'Offices', 'Fleet summary');
  await page.goBack();
  await expect(page).toHaveURL('/offices');
  await expectView(page, 'Offices', 'All offices');
  await page.goForward();
  await expect(page).toHaveURL('/offices/summary');
  await expectView(page, 'Offices', 'Fleet summary');

  await navigation.getByRole('tab', { name: 'Mechanics', exact: true }).click();
  await expectView(page, 'Mechanics', 'All mechanics');
  const workload = page.getByRole('tab', { name: 'Workload', exact: true });
  await expect(workload).toHaveAttribute('href', '/mechanics/workload');
  await workload.click();
  await expect(page).toHaveURL('/mechanics/workload');
  await expectView(page, 'Mechanics', 'Workload');
  await expect(navigation.getByRole('tab', { name: 'Mechanics', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(page.getByRole('table', { name: 'Mechanic workload', exact: true })).toContainText(
    'Ana Martins',
  );
  await capture(page, 'desktop-mechanic-workload');
  await navigation.getByRole('tab', { name: 'Maintenance', exact: true }).click();
  await expect(page).toHaveURL('/maintenance');
  await expect(navigation.getByRole('tab', { name: 'Maintenance', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(page.getByRole('heading', { name: 'Maintenance', exact: true })).toBeVisible();
  await expect(page.getByRole('tablist', { name: 'Maintenance views', exact: true })).toHaveCount(
    0,
  );
});

test('uses the mobile section selector with local tabs, history and completed loading feedback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockLists(page);
  await page.goto('/mechanics/workload');
  await expect(page.getByRole('tablist', { name: 'Main navigation', exact: true })).toHaveCount(0);
  const section = page.getByRole('combobox', { name: /^Section\b/ });
  await expect(section).toHaveText('Mechanics');
  await expectView(page, 'Mechanics', 'Workload');
  await expect(page.getByRole('table', { name: 'Mechanic workload', exact: true })).toContainText(
    'Ana Martins',
  );
  await section.click();
  await expect(page.getByRole('option')).toHaveText(sections);
  await page.getByRole('option', { name: 'Offices', exact: true }).click();
  await expect(page).toHaveURL('/offices');
  await expect(section).toHaveText('Offices');
  await expectView(page, 'Offices', 'All offices');
  await page.goBack();
  await expect(page).toHaveURL('/mechanics/workload');
  await expect(section).toHaveText('Mechanics');
  await expectView(page, 'Mechanics', 'Workload');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await capture(page, 'mobile-mechanic-workload');
  await page.goForward();
  await expect(page).toHaveURL('/offices');
  await expectView(page, 'Offices', 'All offices');

  let release: () => void = () => {};
  let requested = false;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/offices/summary?*', async (route) => {
    if (route.request().headers().rsc === '1') {
      requested = true;
      await pending;
    }
    await route.continue();
  });
  const navigating = page.getByRole('tab', { name: 'Fleet summary', exact: true }).click();
  try {
    await expect.poll(() => requested).toBe(true);
    await expect(page.locator('#nprogress .bar')).toBeVisible();
  } finally {
    release();
  }
  await navigating;
  await expect(page).toHaveURL('/offices/summary');
  await expectView(page, 'Offices', 'Fleet summary');
  await expect(page.locator('#nprogress')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/nprogress-busy/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
