import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Office, Vehicle, VehicleMake, VehicleModel } from '@/lib/types';
import { httpError } from '@/test/http';
import VehicleForm from './vehicle-form';

const offices: Office[] = [
  { id: 1, name: 'New York', city: 'New York' },
  { id: 2, name: 'Boston', city: 'Boston' },
];

const ford: VehicleMake = { id: 1, name: 'Ford' };
const chevrolet: VehicleMake = { id: 2, name: 'Chevrolet' };
const makes = [chevrolet, ford];

const models: VehicleModel[] = [
  { id: 3, name: 'Transit', make: ford },
  { id: 4, name: 'F-150', make: ford },
  { id: 5, name: 'Express', make: chevrolet },
];

const vehicle: Vehicle = {
  id: 7,
  vin: '1HGCM82633A004352',
  license_plate: 'ABC-1234',
  make: ford,
  model: { id: 4, name: 'F-150' },
  year: 2020,
  active: true,
  office: offices[1],
};

function renderForm(props: Partial<Parameters<typeof VehicleForm>[0]> = {}) {
  const onSubmit = vi.fn();
  const view = render(
    <VehicleForm
      initial={vehicle}
      offices={offices}
      makes={makes}
      models={models}
      submitLabel="Save"
      isPending={false}
      error={null}
      onSubmit={onSubmit}
      cancelHref="/vehicles/7"
      {...props}
    />,
  );
  return { onSubmit, ...view };
}

async function choose(user: ReturnType<typeof userEvent.setup>, label: RegExp, option: string) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }));
}

async function optionNames(user: ReturnType<typeof userEvent.setup>, label: RegExp) {
  await user.click(screen.getByRole('combobox', { name: label }));
  const names = within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((option) => option.textContent);
  await user.keyboard('{Escape}');
  return names;
}

function selectedText(label: RegExp) {
  return screen.getByRole('combobox', { name: label }).textContent;
}

describe('VehicleForm', () => {
  it('submits the write payload with model_id, office_id and a numeric year', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const year = screen.getByRole('spinbutton', { name: /Year/ });
    await user.clear(year);
    await user.type(year, '2021');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith({
      vin: '1HGCM82633A004352',
      license_plate: 'ABC-1234',
      model_id: 4,
      year: 2021,
      active: true,
      office_id: 2,
    });
  });

  it('never sends make names, model names or make_id', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    const payload = onSubmit.mock.calls[0][0];
    expect(payload).not.toHaveProperty('make');
    expect(payload).not.toHaveProperty('model');
    expect(payload).not.toHaveProperty('make_id');
  });

  it('initializes make and model from the vehicle on edit', () => {
    renderForm();

    expect(selectedText(/Make/)).toBe('Ford');
    expect(selectedText(/Model/)).toBe('F-150');
  });

  it('lists every make and only the models of the selected make', async () => {
    const user = userEvent.setup();
    renderForm();

    expect(await optionNames(user, /Make/)).toEqual(['Chevrolet', 'Ford']);
    expect(await optionNames(user, /Model/)).toEqual(['Transit', 'F-150']);
  });

  it('clears the model when the make changes to one without it', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await choose(user, /Make/, 'Chevrolet');

    expect(selectedText(/Model/)).not.toContain('F-150');
    expect(await optionNames(user, /Model/)).toEqual(['Express']);
    // The model is required, so the browser blocks the submit until one is chosen.
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the model chosen for a new make', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await choose(user, /Make/, 'Chevrolet');
    await choose(user, /Model/, 'Express');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ model_id: 5 }));
  });

  it('keeps the model when the same make is chosen again', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await choose(user, /Make/, 'Ford');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ model_id: 4 }));
  });

  it('sends active=false when the switch is turned off', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole('switch', { name: 'Active' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
  });

  it('shows API field errors next to their inputs and general errors on top', () => {
    renderForm({
      error: httpError(400, {
        license_plate: ['An active vehicle with this license plate already exists.'],
        office_id: ['Invalid pk "99" - object does not exist.'],
        model_id: ['Invalid pk "42" - object does not exist.'],
        non_field_errors: ['Something is off.'],
      }),
    });

    expect(
      screen.getByText('An active vehicle with this license plate already exists.'),
    ).toBeTruthy();
    expect(
      screen.getByRole('textbox', { name: /License plate/ }).getAttribute('aria-invalid'),
    ).toBe('true');
    expect(screen.getByText('Invalid pk "99" - object does not exist.')).toBeTruthy();
    expect(screen.getByText('Invalid pk "42" - object does not exist.')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('Something is off.');
  });

  it('hides a field error once the user edits that field', async () => {
    const user = userEvent.setup();
    renderForm({
      error: httpError(400, {
        license_plate: ['An active vehicle with this license plate already exists.'],
        vin: ['vehicle with this vin already exists.'],
      }),
    });

    await user.type(screen.getByRole('textbox', { name: /License plate/ }), 'X');

    expect(
      screen.queryByText('An active vehicle with this license plate already exists.'),
    ).toBeNull();
    expect(screen.getByText('vehicle with this vin already exists.')).toBeTruthy();
  });

  it('starts empty and active for a new vehicle, with the model waiting for a make', () => {
    renderForm({ initial: undefined });

    expect((screen.getByRole('textbox', { name: /VIN/ }) as HTMLInputElement).value).toBe('');
    expect((screen.getByRole('switch', { name: 'Active' }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole('combobox', { name: /Model/ }).getAttribute('aria-disabled')).toBe(
      'true',
    );
    expect(screen.getByText('Choose a make first')).toBeTruthy();
  });
});
