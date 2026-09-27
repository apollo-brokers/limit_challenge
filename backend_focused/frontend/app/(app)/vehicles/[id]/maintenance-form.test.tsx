import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { todayIso } from '@/lib/format';
import type { MaintenanceType, Mechanic } from '@/lib/types';
import { httpError } from '@/test/http';
import { MaintenanceForm } from './maintenance-form';

const types: MaintenanceType[] = [
  { id: 1, name: 'Oil Change' },
  { id: 2, name: 'Brake Service' },
];

const mechanics: Mechanic[] = [
  { id: 4, name: 'Jordan Lee', certification_number: 'CERT-1', active: true },
  { id: 5, name: 'Taylor Singh', certification_number: 'CERT-3', active: false },
];

function renderForm(props: Partial<Parameters<typeof MaintenanceForm>[0]> = {}) {
  const onSubmit = vi.fn();
  render(
    <MaintenanceForm
      vehicleId={7}
      types={types}
      mechanics={mechanics}
      isPending={false}
      error={null}
      onSubmit={onSubmit}
      onCancel={() => {}}
      {...props}
    />,
  );
  return { onSubmit };
}

async function choose(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }));
}

describe('MaintenanceForm', () => {
  it('submits the write payload with ids, the date, the cost as text and the notes', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await choose(user, 'Type', 'Brake Service');
    await choose(user, 'Mechanic', 'Jordan Lee (CERT-1)');
    await user.type(screen.getByRole('spinbutton', { name: /Cost/ }), '99.95');
    await user.type(screen.getByRole('textbox', { name: /Notes/ }), 'Front pads');
    await user.click(screen.getByRole('button', { name: 'Add maintenance' }));

    expect(onSubmit).toHaveBeenCalledWith({
      vehicle_id: 7,
      type_id: 2,
      mechanic_id: 4,
      performed_on: todayIso(),
      cost: '99.95',
      notes: 'Front pads',
    });
  });

  it('marks inactive mechanics in the list', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('combobox', { name: 'Mechanic' }));

    expect(screen.getByRole('option', { name: 'Taylor Singh (CERT-3) · inactive' })).toBeTruthy();
  });

  it('shows API field errors next to their inputs and other errors on top', () => {
    renderForm({
      error: httpError(400, {
        cost: ['Ensure this value is greater than or equal to 0.'],
        mechanic_id: ['Invalid pk "99" - object does not exist.'],
        vehicle_id: ['Invalid pk "7" - object does not exist.'],
      }),
    });

    expect(screen.getByText('Ensure this value is greater than or equal to 0.')).toBeTruthy();
    expect(screen.getByRole('spinbutton', { name: /Cost/ }).getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(screen.getByText('Invalid pk "99" - object does not exist.')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain(
      'vehicle_id: Invalid pk "7" - object does not exist.',
    );
  });

  it('hides a field error once the user edits that field', async () => {
    const user = userEvent.setup();
    renderForm({
      error: httpError(400, {
        cost: ['A valid number is required.'],
        notes: ['Too long.'],
      }),
    });

    await user.type(screen.getByRole('spinbutton', { name: /Cost/ }), '10');

    expect(screen.queryByText('A valid number is required.')).toBeNull();
    expect(screen.getByText('Too long.')).toBeTruthy();
  });
});
