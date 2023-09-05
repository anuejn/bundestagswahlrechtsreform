import React, { HTMLProps, useEffect, useMemo, useState } from 'react';
import {
  CalculationContext,
  ParteiErgebniss,
  election1956,
  election2011,
  election2013,
  election2020,
  election2023,
  electionMethods,
  electionNurZweitstimmen,
} from './calculate_election';
import { sainteLaguë } from './appointment_method';
import { partiesSorted, partyColors } from './parties';
import { electionsYears, getElectionData } from './btw_kerg';
import {
  BarPlot,
  ChartsAxis,
  ChartsAxisHighlight,
  ChartsTooltip,
  DEFAULT_X_AXIS_KEY,
  DEFAULT_Y_AXIS_KEY,
  LineChart,
  PiePlot,
  ResponsiveChartContainer,
  axisClasses,
  pieArcClasses,
  useDrawingArea,
  useYScale,
} from '@mui/x-charts';
import { Alert, styled } from '@mui/material';
import { RecordSelect, useRecordSelectState } from './RecordSelect';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { mapRecord, sumRecord1D } from './util';

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

export function Wahl({ year, method }: { year: number | string; method: typeof election2020 }) {
  const electionData = getElectionData(year);
  const ctx: CalculationContext = {
    ...electionData,
    apportionmentMethod: sainteLaguë,
    sitze: electionData.kerg.wahlkreise.length * 2,
    warnings: [],
  };

  const data = partiesSorted(method(ctx)).map((party) => ({
    ...party,
    label: party.name,
    value: Math.max(ctx.sitze * 0.01, party.sitze), // we do this so that small parties are still visible
  }));

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
            innerRadius: 40,
            data,
            highlightScope: { faded: 'global' },
            valueFormatter: (v) => (v as unknown as ParteiErgebniss).sitze.toString(),
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
  const method = useRecordSelectState(electionMethods, 'SVV2023');

  return (
    <>
      <Wahl year={year.state} method={method.state} />
      <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'row', gap: 10 }}>
        <RecordSelect state={method} label="Sitzzuteilungsverfahren" />
        <RecordSelect state={year} label="Wahljahr" />
      </div>
    </>
  );
}

const StyledLine = styled('line')(({ theme }) => ({
  fill: 'none',
  stroke: theme.palette.text.primary,
  shapeRendering: 'crispEdges',
  strokeWidth: 1,
  pointerEvents: 'none',
}));

function ZeroLine() {
  const yAxisScale = useYScale();
  const { left, width } = useDrawingArea();
  return <StyledLine x1={left} x2={left + width} y1={yAxisScale(0)} y2={yAxisScale(0)} />;
}

export function WahlDiff({ year }: { year: number | string }) {
  const electionData = getElectionData(year);
  const electionMethods = {
    SVV1956: election1956,
    SVV2011: election2011,
    SVV2013: election2013,
    SVV2020: election2020,
    SVV2023: election2023,
  };

  let xaxis: string[] = [];
  const series = Object.entries(electionMethods)
    .filter(([k, v]) => k != 'Zweitstimmen')
    .map(([methodName, method]) => {
      const ctx: CalculationContext = {
        ...electionData,
        apportionmentMethod: sainteLaguë,
        sitze: electionData.kerg.wahlkreise.length * 2,
        warnings: [],
      };
      const result = method(ctx);
      const nurZweitstimmen = electionNurZweitstimmen(ctx);

      const sorted = partiesSorted({ ...result, ...nurZweitstimmen });
      xaxis = sorted.map((party) => party.name.split(' ').reverse()[0]);
      return {
        type: 'bar' as 'bar',
        data: sorted.map(
          (party) => (result[party.name]?.sitze || 0) - (nurZweitstimmen[party.name]?.sitze || 0)
        ),
        label: methodName,
      };
    });

  return (
    <ResponsiveChartContainer
      series={series}
      xAxis={[{ data: xaxis, scaleType: 'band', id: DEFAULT_X_AXIS_KEY }]}
      margin={{ right: 15, left: 50, top: 45 }}
      height={300}
      sx={{
        [`.${axisClasses.left} .${axisClasses.label}`]: {
          transform: 'rotate(-90deg) translate(0px, -10px)',
        },
      }}
    >
      <BarPlot />
      <ChartsLegend />
      <ChartsTooltip />
      <ChartsAxis
        bottomAxis={{ axisId: DEFAULT_X_AXIS_KEY, disableLine: true }}
        leftAxis={{ label: 'Differenz Sitzzahl', axisId: DEFAULT_Y_AXIS_KEY }}
      />
      <ChartsAxisHighlight x="band" />
      <ZeroLine />
    </ResponsiveChartContainer>
  );
}

export function WahlDiffSelectable() {
  const year = useRecordSelectState(Object.fromEntries(electionsYears.map((y) => [y, y])), '2021');

  return (
    <>
      <WahlDiff year={year.state} />
      <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'row', gap: 10 }}>
        <RecordSelect state={year} label="Wahljahr" />
      </div>
    </>
  );
}

export function ParlamentGröße() {
  const series = Object.entries(electionMethods).map(([methodName, method]) => {
    const data = electionsYears.map((year) => {
      const electionData = getElectionData(year);
      const ctx: CalculationContext = {
        ...electionData,
        apportionmentMethod: sainteLaguë,
        sitze: electionData.kerg.wahlkreise.length * 2,
        warnings: [],
      };
      method(ctx);
      return ctx.sitze;
    });

    return {
      type: 'line' as 'line',
      data,
      label: methodName,
      curve: 'linear' as 'linear',
    };
  });

  return (
    <LineChart
      bottomAxis={{
        label: 'Jahr (PROJ = 2021 mit CSU unter Sperrklausel)',
        axisId: DEFAULT_X_AXIS_KEY,
      }}
      leftAxis={{ label: 'Parlamentsgröße in Sitzen', axisId: DEFAULT_Y_AXIS_KEY }}
      xAxis={[
        {
          data: electionsYears.map((y) => (y == 'PROJ CSU Sperrklausel' ? 2025 : y)),
          valueFormatter: (v) => (v == 2025 ? 'PROJ' : v.toString()),
          id: DEFAULT_X_AXIS_KEY,
          tickMaxStep: 10,
        },
      ]}
      margin={{ right: 15, left: 50, top: 45 }}
      series={series}
      height={500}
      sx={{
        '.MuiMarkElement-root': {
          scale: '0.6',
          strokeWidth: 2,
        },
        [`.${axisClasses.left} .${axisClasses.label}`]: {
          transform: 'rotate(-90deg) translate(0px, -10px)',
        },
      }}
    />
  );
}

export function ParteienZweitstimmen() {
  const parteien = mapRecord(partyColors, (_, party) => [] as number[]);
  electionsYears.forEach((year) => {
    const electionData = getElectionData(year);
    Object.entries(parteien).forEach(([partei, results]) => {
      results.push(
        ((electionData.kerg.bundesgebiet.parteien.find((p) => p.name == partei)?.zweitstimmen ||
          0) /
          electionData.kerg.bundesgebiet.wähler) *
          100
      );
    });
  });

  const series = Object.entries(parteien).map(([partei, results]) => ({
    type: 'line' as 'line',
    data: results,
    label: partei,
    curve: 'linear' as 'linear',
    valueFormatter: (v: number) => `${v.toFixed(1)}%`,
    color: partyColors[partei as keyof typeof partyColors],
  }));

  return (
    <LineChart
      legend={{ hidden: true }}
      bottomAxis={{
        label: 'Jahr (PROJ = 2021 mit CSU unter Sperrklausel)',
        axisId: DEFAULT_X_AXIS_KEY,
      }}
      leftAxis={{ label: 'Zweitstimmenanteil in %', axisId: DEFAULT_Y_AXIS_KEY }}
      xAxis={[
        {
          data: electionsYears.map((y) => (y == 'PROJ CSU Sperrklausel' ? 2025 : y)),
          valueFormatter: (v) => (v == 2025 ? 'PROJ' : v.toString()),
          id: DEFAULT_X_AXIS_KEY,
          tickMaxStep: 10,
        },
      ]}
      margin={{ right: 15, left: 40, top: 45 }}
      series={series}
      height={500}
      sx={{
        '.MuiMarkElement-root': {
          scale: '0.6',
          strokeWidth: 2,
        },
      }}
    />
  );
}

export function ÜberhangMandate() {
  const method = useRecordSelectState(
    {
      SVV1956: election1956,
      SVV2011: election2011,
      SVV2013: election2013,
      SVV2020: election2020,
    },
    'SVV2011'
  );

  const parteien = mapRecord(partyColors, (_, party) => [] as number[]);
  electionsYears.forEach((year) => {
    const electionData = getElectionData(year);
    const ctx: CalculationContext = {
      ...electionData,
      apportionmentMethod: sainteLaguë,
      sitze: electionData.kerg.wahlkreise.length * 2,
      warnings: [],
    };
    const result = method.state(ctx);
    Object.entries(parteien).forEach(([partei, results]) => {
      results.push(result[partei]?.überhangMandate || 0);
    });
  });

  const series = Object.entries(parteien).map(([partei, results]) => ({
    type: 'line' as 'line',
    data: results,
    label: partei,
    curve: 'linear' as 'linear',
    color: partyColors[partei as keyof typeof partyColors],
  }));

  return (
    <>
      <LineChart
        legend={{ hidden: true }}
        bottomAxis={{
          label: 'Jahr (PROJ = 2021 mit CSU unter Sperrklausel)',
          axisId: DEFAULT_X_AXIS_KEY,
        }}
        leftAxis={{
          label: 'Anzahl der Unausgeglichenen Überhangmandate je Partei',
          axisId: DEFAULT_Y_AXIS_KEY,
        }}
        xAxis={[
          {
            data: electionsYears.map((y) => (y == 'PROJ CSU Sperrklausel' ? 2025 : y)),
            valueFormatter: (v) => (v == 2025 ? 'PROJ' : v.toString()),
            id: DEFAULT_X_AXIS_KEY,
            tickMaxStep: 10,
          },
        ]}
        margin={{ right: 15, left: 40, top: 45 }}
        series={series}
        height={500}
        sx={{
          '.MuiMarkElement-root': {
            scale: '0.6',
            strokeWidth: 2,
          },
        }}
      />
      <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'row', gap: 10 }}>
        <RecordSelect state={method} label="Sitzzuteilungsverfahren" />
      </div>
    </>
  );
}

export function ÜberhangMandateTotal() {
  const methods = {
    SVV1956: election1956,
    SVV2011: election2011,
    SVV2013: election2013,
    SVV2020: election2020,
  };

  const methodResults = mapRecord(methods, () => [] as number[]);
  electionsYears.forEach((year) => {
    const electionData = getElectionData(year);
    Object.entries(methods).forEach(([methodName, method]) => {
      const ctx: CalculationContext = {
        ...electionData,
        apportionmentMethod: sainteLaguë,
        sitze: electionData.kerg.wahlkreise.length * 2,
        warnings: [],
      };
      const result = method(ctx);
      methodResults[methodName].push(sumRecord1D(mapRecord(result, (r) => r.überhangMandate)));
    });
  });

  const series = Object.entries(methodResults).map(([method, results]) => ({
    type: 'line' as 'line',
    data: results,
    label: method,
    curve: 'linear' as 'linear',
  }));

  return (
    <LineChart
      bottomAxis={{
        label: 'Jahr (PROJ = 2021 mit CSU unter Sperrklausel)',
        axisId: DEFAULT_X_AXIS_KEY,
      }}
      leftAxis={{
        label: 'Anzahl der Unausgeglichenen Überhangmandate Aller Parteien',
        axisId: DEFAULT_Y_AXIS_KEY,
      }}
      xAxis={[
        {
          data: electionsYears.map((y) => (y == 'PROJ CSU Sperrklausel' ? 2025 : y)),
          valueFormatter: (v) => (v == 2025 ? 'PROJ' : v.toString()),
          id: DEFAULT_X_AXIS_KEY,
          tickMaxStep: 10,
        },
      ]}
      margin={{ right: 15, left: 40, top: 45 }}
      series={series}
      height={500}
      sx={{
        '.MuiMarkElement-root': {
          scale: '0.6',
          strokeWidth: 2,
        },
      }}
    />
  );
}

export function AnteilVergleich() {
  const methodA = useRecordSelectState(electionMethods, 'SVV2020');
  const methodB = useRecordSelectState(electionMethods, 'SVV2023');

  const parteien = mapRecord(partyColors, (_, party) => [] as number[]);
  electionsYears.forEach((year) => {
    const electionData = getElectionData(year);
    const ctx: CalculationContext = {
      ...electionData,
      apportionmentMethod: sainteLaguë,
      sitze: electionData.kerg.wahlkreise.length * 2,
      warnings: [],
    };
    const resultA = methodA.state(ctx);
    const sitzeA = ctx.sitze;

    ctx.sitze = electionData.kerg.wahlkreise.length * 2;
    const resultB = methodB.state(ctx);
    const sitzeB = ctx.sitze;

    Object.entries(parteien).forEach(([partei, results]) => {
      results.push(
        ((resultB[partei]?.sitze || 0) / sitzeB) * 100 -
          ((resultA[partei]?.sitze || 0) / sitzeA) * 100
      );
    });
  });

  const series = Object.entries(parteien).map(([partei, results]) => ({
    type: 'line' as 'line',
    data: results,
    label: partei,
    curve: 'linear' as 'linear',
    color: partyColors[partei as keyof typeof partyColors],
    valueFormatter: (v: number) => `${v.toFixed(2)}%`,
  }));

  return (
    <>
      <LineChart
        legend={{ hidden: true }}
        xAxis={[
          {
            data: electionsYears.map((y) => (y == 'PROJ CSU Sperrklausel' ? 2025 : y)),
            valueFormatter: (v) => (v == 2025 ? 'PROJ' : v.toString()),
            id: DEFAULT_X_AXIS_KEY,
            tickMaxStep: 10,
          },
        ]}
        margin={{ right: 15, left: 40, top: 45 }}
        bottomAxis={{
          label: 'Jahr (PROJ = 2021 mit CSU unter Sperrklausel)',
          axisId: DEFAULT_X_AXIS_KEY,
        }}
        leftAxis={{
          label: 'Unterschied des Prozentualen Sitzanteils B - A',
          axisId: DEFAULT_Y_AXIS_KEY,
        }}
        series={series}
        height={500}
        sx={{
          '.MuiMarkElement-root': {
            scale: '0.6',
            strokeWidth: 2,
          },
        }}
      />
      <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'row', gap: 10 }}>
        <RecordSelect state={methodA} label="Sitzzuteilungsverfahren A" />
        <RecordSelect state={methodB} label="Sitzzuteilungsverfahren B" />
      </div>
    </>
  );
}
