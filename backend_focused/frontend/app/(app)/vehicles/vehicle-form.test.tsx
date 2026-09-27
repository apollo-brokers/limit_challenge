import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Office, Vehicle } from '@/lib/types';
import { httpError } from '@/test/http';
import VehicleForm from './vehicle-form';

const offices: Office[] = [
  { id: 1, name: 'New York', city: 'New York' },
  { id: 2, name: 'Boston', city: 'Boston' },
];

const vehicle: Vehicle = {
  id: 7,
  vin: '1HGCM82633A004352',
  license_plate: 'ABC-1234',
  make: 'Toyota',
  model: 'Corolla',
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

describe('VehicleForm', () => {
  it('submits the write payload with office_id and a numeric year', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const year = screen.getByRole('spinbutton', { name: /Year/ });
    await user.clear(year);
    await user.type(year, '2021');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith({
      vin: '1HGCM82633A004352',
      license_plate: 'ABC-1234',
      make: 'Toyota',
      model: 'Corolla',
      year: 2021,
      active: true,
      office_id: 2,
    });
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

  it('starts empty and active for a new vehicle', () => {
    renderForm({ initial: undefined });

    expect((screen.getByRole('textbox', { name: /VIN/ }) as HTMLInputElement).value).toBe('');
    expect((screen.getByRole('switch', { name: 'Active' }) as HTMLInputElement).checked).toBe(true);
  });
});
