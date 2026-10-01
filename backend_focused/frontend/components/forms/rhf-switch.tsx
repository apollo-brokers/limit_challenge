'use client';

import { FormControlLabel, Switch } from '@mui/material';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

export function RHFSwitch<T extends FieldValues = FieldValues>({
  name,
  label,
  disabled,
}: {
  name: FieldPath<T>;
  label: string;
  disabled?: boolean;
}) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          label={label}
          control={
            <Switch
              name={field.name}
              checked={!!field.value}
              onChange={(_, checked) => field.onChange(checked)}
              onBlur={field.onBlur}
              inputRef={field.ref}
              disabled={disabled}
            />
          }
        />
      )}
    />
  );
}
