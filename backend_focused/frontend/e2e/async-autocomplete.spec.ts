import type { Office, Vehicle } from '../lib/api/types';
import { apiURL, expect, test } from './fixtures';

const emptyPage = { count: 0, next: null, previous: null, results: [] };
const office = (id: number, name: string): Office => ({
  id,
  name,
  city: 'Salvador',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});
const label = (value: Office) => `${value.name} · ${value.city}`;

test('debounces remote office searches, ignores stale results and never submits free text as an ID', async ({
  page,
}) => {
  const initial = office(1, 'Initial office');
  const old = office(2, 'Old office');
  const current = office(3, 'New office');
  const searches: string[] = [];
  let failSearch = true;
  let releaseOld: () => void = () => {};
  let oldFinished = false;
  const oldResponse = new Promise<void>((resolve) => {
    releaseOld = resolve;
  });
  await page.route('**/api/offices/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === `/api/offices/${current.id}/`) {
      await route.fulfill({ json: current });
      return;
    }
    const search = url.searchParams.get('search') ?? '';
    if (search) searches.push(search);
    if (search.startsWith('Offline') && failSearch) {
      await route.abort('failed');
      return;
    }
    if (search === 'Old') await oldResponse;
    const results =
      search === 'Old' ? [old] : search === 'New' ? [current] : search ? [] : [initial];
    await route.fulfill({ json: { ...emptyPage, count: results.length, results } });
    if (search === 'Old') oldFinished = true;
  });
  await page.route('**/api/vehicles/**', (route) => route.fulfill({ json: emptyPage }));
  await page.clock.install({ time: new Date('2026-09-29T09:00:00Z') });
  await page.goto('/vehicles');
  await expect(page.getByText('0 vehicles found')).toBeVisible();
  const input = page.getByRole('combobox', { name: 'Office', exact: true });
  await input.click();
  await expect(page.getByRole('option', { name: label(initial), exact: true })).toBeVisible();
  await page.clock.pauseAt(new Date('2026-09-29T10:00:00Z'));

  await input.fill('O');
  await page.clock.runFor(500);
  expect(searches).toEqual([]);
  await input.fill('Ol');
  await page.clock.runFor(200);
  await input.fill('Old');
  await page.clock.runFor(349);
  expect(searches).toEqual([]);
  const oldRequest = page.waitForRequest(
    (request) => new URL(request.url()).searchParams.get('search') === 'Old',
  );
  await page.clock.runFor(1);
  await oldRequest;
  await page.clock.resume();
  await input.fill('New');
  const currentOption = page.getByRole('option', { name: label(current), exact: true });
  await expect(currentOption).toBeVisible();
  releaseOld();
  await expect.poll(() => oldFinished).toBe(true);
  await expect(currentOption).toBeVisible();
  await expect(page.getByRole('option', { name: label(old), exact: true })).toHaveCount(0);
  await currentOption.click();
  await expect(input).toHaveValue(label(current));
  await page.clock.runFor(500);
  expect(searches).toEqual(['Old', 'New']);

  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page).toHaveURL('/vehicles?office=3');
  await input.hover();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(input).toHaveValue('');
  await page.clock.runFor(500);
  expect(searches).toEqual(['Old', 'New']);
  await input.fill('Unselected office');
  await input.press('Tab');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page).toHaveURL('/vehicles');
  await input.fill('Missing');
  await expect(page.getByText('No matches found.', { exact: true })).toBeVisible();
  await input.fill('Offline');
  const retryHint = page.getByText('Could not load options. Press Enter to retry.', {
    exact: true,
  });
  await expect(retryHint).toBeVisible();
  failSearch = false;
  const retryResponse = page.waitForResponse(
    (response) => new URL(response.url()).searchParams.get('search') === 'Offline',
  );
  await page.getByRole('button', { name: 'Retry', exact: true }).click({ timeout: 15_000 });
  await retryResponse;
  await expect(page.getByText('No matches found.', { exact: true })).toBeVisible();
  failSearch = true;
  await input.fill('Offline keyboard');
  await expect(retryHint).toBeVisible();
  failSearch = false;
  const keyboardResponse = page.waitForResponse(
    (response) => new URL(response.url()).searchParams.get('search') === 'Offline keyboard',
  );
  await input.press('Enter');
  await keyboardResponse;
  await expect(page.getByText('No matches found.', { exact: true })).toBeVisible();
  await expect(input).toHaveValue('Offline keyboard');
});

test('restores an office outside the first page from the URL and edit form, and loads further search matches', async ({
  page,
}) => {
  const branches = Array.from({ length: 12 }, (_, index) =>
    office(index + 1, `Branch ${index + 1}`),
  );
  const selected = office(901, 'Remote headquarters');
  const vehicle: Vehicle = {
    id: 1001,
    vin: 'AUTOCOMPLETE-VIN',
    license_plate: 'AUT-1001',
    make: 'Fleet',
    model: 'Van',
    year: 2026,
    active: true,
    office: selected.id,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
  let selectedRequests = 0;
  let secondSearchPage = 0;
  let savedOffice: number | undefined;
  await page.route('**/api/offices/**', async (route) => {
    const url = new URL(route.request().url());
    const detail = [...branches, selected].find(
      (item) => url.pathname === `/api/offices/${item.id}/`,
    );
    if (detail) {
      if (detail.id === selected.id) selectedRequests += 1;
      await route.fulfill({ json: detail });
      return;
    }
    const search = url.searchParams.get('search') ?? '';
    const pageNumber = Number(url.searchParams.get('page') ?? 1);
    if (search === 'Branch' && pageNumber === 2) secondSearchPage += 1;
    const matches = search === 'Branch' ? branches : [...branches, selected];
    await route.fulfill({
      json: {
        count: matches.length,
        next: pageNumber === 1 ? `${apiURL}/offices/?page=2&search=${search}` : null,
        previous: pageNumber > 1 ? `${apiURL}/offices/?page=1&search=${search}` : null,
        results: matches.slice((pageNumber - 1) * 10, pageNumber * 10),
      },
    });
  });
  await page.route('**/api/vehicles/**', async (route) => {
    if (route.request().method() === 'PUT') {
      savedOffice = (route.request().postDataJSON() as { office: number }).office;
      await route.fulfill({ json: { ...vehicle, office: savedOffice } });
    } else {
      await route.fulfill({ json: { ...emptyPage, count: 1, results: [vehicle] } });
    }
  });
  await page.goto(`/vehicles?office=${selected.id}`);
  const filter = page.getByRole('combobox', { name: 'Office', exact: true });
  await expect(filter).toHaveValue(label(selected));
  expect(selectedRequests).toBeGreaterThan(0);
  await page.reload();
  await expect(filter).toHaveValue(label(selected));
  await page.getByRole('button', { name: `Edit ${vehicle.license_plate}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit vehicle' });
  const input = dialog.getByRole('combobox', { name: 'Office', exact: true });
  await expect(input).toHaveValue(label(selected));
  const searchResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === '/api/offices/' && url.searchParams.get('search') === 'Branch';
  });
  await input.fill('Branch');
  await searchResponse;
  const firstOption = page.getByRole('option', { name: label(branches[0]), exact: true });
  await expect(firstOption).toBeVisible();
  await expect(page.getByRole('option', { name: label(branches[11]), exact: true })).toHaveCount(0);
  expect(secondSearchPage).toBe(0);
  await page.getByRole('listbox').evaluate((list) => {
    list.scrollTop = list.scrollHeight;
  });
  await page.getByRole('option', { name: label(branches[11]), exact: true }).click();
  expect(secondSearchPage).toBe(1);
  await expect(input).toHaveValue(label(branches[11]));
  await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(savedOffice).toBe(branches[11].id);
});
