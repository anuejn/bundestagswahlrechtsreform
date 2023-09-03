import React, { HTMLProps, useEffect, useMemo, useState } from 'react';
import { CalculationContext, election2020, electionMethods } from './calculate_election';
import { sainteLaguë } from './appointment_method';
import { partiesSorted } from './parties';
import { electionsYears, getElectionData } from './btw_kerg';
import {
  ChartsTooltip,
  PieChart,
  PiePlot,
  ResponsiveChartContainer,
  pieArcClasses,
  useDrawingArea,
} from '@mui/x-charts';
import { Alert, FormControl, InputLabel, MenuItem, Select, styled } from '@mui/material';

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

  const StyledText = styled('text')(({ theme }) => ({
    stroke: 'none',
    fill: theme.palette.text.primary,
    shapeRendering: 'crispEdges',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: '16pt',
  }));

  function CenterText({ children }: { children: React.ReactNode }) {
    const { left, top, width, height } = useDrawingArea();
    return (
      <StyledText x={left + width / 2} y={top + height / 2 + 5} textAnchor="middle">
        {children}
      </StyledText>
    );
  }

  return (
    <>
      <ResponsiveChartContainer
        margin={{ top: 20, left: 10, right: 10, bottom: -110 }}
        height={300}
        sx={{
          [`& .${pieArcClasses.faded}`]: {
            fill: 'gray',
          },
        }}
        series={[
          {
            type: 'pie',
            startAngle: -110,
            endAngle: 110,
            paddingAngle: 0.5,
            innerRadius: 40,
            data,
            highlightScope: { faded: 'global' },
            valueFormatter: (v) => v.sitze,
          },
        ]}
      >
        <PiePlot />
        <ChartsTooltip trigger="item" />
        <CenterText>{ctx.sitze}</CenterText>
      </ResponsiveChartContainer>
      {ctx.warnings.map((w) => (
        <Alert severity="warning">{w}</Alert>
      ))}
    </>
  );
}

export function WahlSelectable() {
  const year = useRecordSelectState(Object.fromEntries(electionsYears.map((y) => [y, y])), '2021');
  const methode = useRecordSelectState(electionMethods, '2020');

  return (
    <>
      <Wahl year={year.state} method={methode.state} />
      <div style={{ paddingTop: 10 }}>
        <RecordSelect state={methode} label="Methode" />
        <RecordSelect state={year} label="Jahr" />
      </div>
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
