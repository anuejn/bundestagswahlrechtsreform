import React, { HTMLProps, useEffect, useMemo, useState } from 'react';
import { CalculationContext, election2020, electionMethods } from './calculate_election';
import { sainteLaguë } from './appointment_method';
import { partiesSorted } from './parties';
import { electionsYears, getElectionData } from './btw_kerg';
import { PieChart, pieArcClasses } from '@mui/x-charts';
import { Alert, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export function Wahl({ year, method }: { year: number; method: typeof election2020 }) {
  const ctx: CalculationContext = {
    ...getElectionData(year),
    apportionmentMethod: sainteLaguë,
    sitze: 598,
    warnings: [],
  };

  const data = partiesSorted(method(ctx)).map((party) => ({
    ...party,
    label: party.name,
    value: Math.max(10, party.sitze), // we do this so that small parties are still visible
  }));

  return (
    <>
      <PieChart
        series={[
          {
            startAngle: -110,
            endAngle: 110,
            paddingAngle: 0.5,
            innerRadius: 40,
            outerRadius: 200,
            cy: 200,
            data,
            highlightScope: { faded: 'global' },
            valueFormatter: (v) => v.sitze,
          },
        ]}
        sx={{
          [`& .${pieArcClasses.faded}`]: {
            fill: 'gray',
          },
        }}
        height={300}
        legend={{ hidden: true }}
      />
      {ctx.warnings.map((w) => (
        <Alert severity="warning">{w}</Alert>
      ))}
    </>
  );
}

export function WahlSelectable() {
  const year = useRecordSelectState(Object.fromEntries(electionsYears.map((y) => [y, y])), '2021');
  const methode = useRecordSelectState(electionMethods);

  return (
    <>
      <Wahl year={year.state} method={methode.state} />
      <RecordSelect state={methode} label="Methode" />
      <RecordSelect state={year} label="Jahr" />
    </>
  );
}

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
    <FormControl>
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
