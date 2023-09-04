import React, { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

type RecordSelectState<T> = {
  state: T;
  setState: (next: T) => void;
  record: Record<string, T>;
};

export function useRecordSelectState<T>(
  record: Record<string, T>,
  initial?: string
): RecordSelectState<T> {
  const initialValue = initial ? record[initial] : Object.values(record)[0];
  const [state, setState] = useState(() => initialValue);
  return {
    state,
    setState: (next: T) => setState(() => next),
    record,
  };
}

export function RecordSelect<T>({ state, label }: { state: RecordSelectState<T>; label: string }) {
  return (
    <FormControl style={{ flexGrow: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={(Object.entries(state.record).find(([k, v]) => v == state.state) || [])[0]}
        label={label}
        onChange={(e) => state.setState(state.record[e.target.value as string])}
      >
        {Object.keys(state.record).map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
