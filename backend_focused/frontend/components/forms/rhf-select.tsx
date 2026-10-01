'use client';

import { MenuItem } from '@mui/material';
import { FieldValues, useFormContext, useWatch } from 'react-hook-form';
import { RHFTextField, RHFTextFieldProps } from './rhf-text-field';

export function RHFSelect<T extends FieldValues = FieldValues>({
  options,
  ...props
}: RHFTextFieldProps<T> & { options: { value: string | number; label: string }[] }) {
  const { control } = useFormContext<T>();
  const selected = useWatch({ control, name: props.name });
  const missingSelection =
    (typeof selected === 'string' || typeof selected === 'number') &&
    selected !== '' &&
    !options.some((option) => String(option.value) === String(selected));

  return (
    <RHFTextField<T> {...props} select>
      {missingSelection && (
        <MenuItem value={selected} disabled>
          {props.disabled ? 'Loading selection…' : 'Selection unavailable'}
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </RHFTextField>
  );
}
