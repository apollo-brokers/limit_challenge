import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Office, VehicleMake, VehicleModel } from '@/lib/types';
import {
  EMPTY_FILTERS,
  type VehicleFilters,
  parseVehicleSearch,
  toSearchParams,
} from '@/lib/vehicle-search';
import VehicleFiltersForm from './vehicle-filters';

const offices: Office[] = [{ id: 1, name: 'New York', city: 'New York' }];

const ford: VehicleMake = { id: 1, name: 'Ford' };
const chevrolet: VehicleMake = { id: 2, name: 'Chevrolet' };
const makes = [chevrolet, ford];

const models: VehicleModel[] = [
  { id: 5, name: 'Express', make: chevrolet },
  { id: 4, name: 'F-150', make: ford },
  { id: 3, name: 'Transit', make: ford },
];

type Props = Parameters<typeof VehicleFiltersForm>[0];

function formElement(props: Partial<Props>, onSearch = vi.fn(), onClear = vi.fn(), key = '') {
  return (
    <VehicleFiltersForm
      key={key}
      initial={EMPTY_FILTERS}
      offices={offices}
      officesFailed={false}
      makes={makes}
      models={models}
      catalogFailed={false}
      errors={{}}
      onSearch={onSearch}
      onClear={onClear}
      {...props}
    />
  );
}

function renderFilters(props: Partial<Props> = {}) {
  const onSearch = vi.fn();
  const onClear = vi.fn();
  const view = render(formElement(props, onSearch, onClear));
  return { onSearch, onClear, ...view };
}

async function choose(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }));
}

async function optionNames(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole('combobox', { name: label }));
  const names = within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((option) => option.textContent);
  await user.keyboard('{Escape}');
  return names;
}

function selectedText(label: string) {
  return screen.getByRole('combobox', { name: label }).textContent;
}

function submittedFilters(onSearch: ReturnType<typeof vi.fn>): VehicleFilters {
  return onSearch.mock.calls[0][0];
}

describe('VehicleFiltersForm', () => {
  it('starts with any make and any model', () => {
    renderFilters();

    expect(selectedText('Make')).toBe('Any make');
    expect(selectedText('Model')).toBe('Any model');
  });

  it('lists every make, and every model with its make while no make is chosen', async () => {
    const user = userEvent.setup();
    renderFilters();

    expect(await optionNames(user, 'Make')).toEqual(['Any make', 'Chevrolet', 'Ford']);
    expect(await optionNames(user, 'Model')).toEqual([
      'Any model',
      'Chevrolet · Express',
      'Ford · F-150',
      'Ford · Transit',
    ]);
  });

  it('lists only the models of the chosen make', async () => {
    const user = userEvent.setup();
    renderFilters();

    await choose(user, 'Make', 'Ford');

    expect(await optionNames(user, 'Model')).toEqual(['Any model', 'F-150', 'Transit']);
  });

  it('searches with make and model ids, which become the URL query', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderFilters();

    await choose(user, 'Make', 'Ford');
    await choose(user, 'Model', 'Transit');
    expect(onSearch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Search' }));

    const filters = submittedFilters(onSearch);
    expect(filters).toEqual({ ...EMPTY_FILTERS, make: '1', model: '3' });
    expect(toSearchParams({ filters, page: 1 }).toString()).toBe('make=1&model=3');
  });

  it('can search by model without a make', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderFilters();

    await choose(user, 'Model', 'Chevrolet · Express');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(submittedFilters(onSearch)).toEqual({ ...EMPTY_FILTERS, model: '5' });
  });

  it('clears a draft model of another make when the make changes', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderFilters();

    await choose(user, 'Model', 'Ford · Transit');
    await choose(user, 'Make', 'Chevrolet');

    expect(selectedText('Model')).toBe('Any model');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(submittedFilters(onSearch)).toEqual({ ...EMPTY_FILTERS, make: '2' });
  });

  it('keeps a draft model that belongs to the new make', async () => {
    const user = userEvent.setup();
    renderFilters();

    await choose(user, 'Model', 'Ford · Transit');
    await choose(user, 'Make', 'Ford');

    expect(selectedText('Model')).toBe('Transit');
  });

  it('restores make and model from URL ids when remounted, as on back and forward', () => {
    const { rerender } = renderFilters();

    const search = parseVehicleSearch(new URLSearchParams('make=1&model=4'));
    rerender(formElement({ initial: search.filters }, vi.fn(), vi.fn(), 'make=1&model=4'));

    expect(selectedText('Make')).toBe('Ford');
    expect(selectedText('Model')).toBe('F-150');
  });

  it('Clear resets both catalog filters and asks for a queryless search', async () => {
    const user = userEvent.setup();
    const { onClear } = renderFilters({ initial: { ...EMPTY_FILTERS, make: '1', model: '3' } });

    await choose(user, 'Make', 'Chevrolet');
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClear).toHaveBeenCalledOnce();
    expect(selectedText('Make')).toBe('Any make');
    expect(selectedText('Model')).toBe('Any model');
    expect(toSearchParams({ filters: EMPTY_FILTERS, page: 1 }).toString()).toBe('');
  });

  it('shows API errors for make and model under their selects', () => {
    renderFilters({
      initial: { ...EMPTY_FILTERS, make: '2', model: '3' },
      errors: { model: 'Model 3 does not belong to make 2.' },
    });

    expect(screen.getByText('Model 3 does not belong to make 2.')).toBeTruthy();
    // The incompatible model stays visible, with its make, so the message makes sense.
    expect(selectedText('Model')).toBe('Ford · Transit');
  });

  it('keeps unknown ids from the URL visible next to the API error', () => {
    renderFilters({
      initial: { ...EMPTY_FILTERS, make: '99', model: '98' },
      errors: {
        make: 'Invalid pk "99" - object does not exist.',
        model: 'Invalid pk "98" - object does not exist.',
      },
    });

    expect(selectedText('Make')).toBe('Unknown make #99');
    expect(selectedText('Model')).toBe('Unknown model #98');
    expect(screen.getByText('Invalid pk "99" - object does not exist.')).toBeTruthy();
    expect(screen.getByText('Invalid pk "98" - object does not exist.')).toBeTruthy();
  });

  it('disables the catalog selects until they load and says when loading failed', () => {
    renderFilters({ makes: undefined, models: undefined, catalogFailed: true });

    expect(screen.getByRole('combobox', { name: 'Make' }).getAttribute('aria-disabled')).toBe(
      'true',
    );
    expect(screen.getByText('Could not load makes')).toBeTruthy();
    expect(screen.getByText('Could not load models')).toBeTruthy();
  });
});
