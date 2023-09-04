import React, { HTMLProps, useEffect, useMemo, useState } from 'react';
import {
  CalculationContext,
  ParteiErgebniss,
  election1956,
  election2011,
  election2013,
  election2020,
  electionMethods,
  electionNurZweitstimmen,
} from './calculate_election';
import { sainteLaguë } from './appointment_method';
import { partiesSorted, partyColors } from './parties';
import { electionsYears, getElectionData } from './btw_kerg';
import {
  BarChart,
  BarPlot,
  ChartsAxis,
  ChartsAxisHighlight,
  ChartsTooltip,
  DEFAULT_X_AXIS_KEY,
  LineChart,
  PiePlot,
  ResponsiveChartContainer,
  pieArcClasses,
  useDrawingArea,
  useYScale,
} from '@mui/x-charts';
import { Alert, styled } from '@mui/material';
import { RecordSelect, useRecordSelectState } from './RecordSelect';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { mapRecord } from './util';

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
  const method = useRecordSelectState(electionMethods, '2023');

  return (
    <>
      <Wahl year={year.state} method={method.state} />
      <div style={{ paddingTop: 10 }}>
        <RecordSelect state={method} label="Methode" />
        <RecordSelect state={year} label="Jahr" />
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
      xaxis = sorted.map((party) => party.name);
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
      xAxis={[{ data: xaxis, scaleType: 'band' }]}
      height={300}
    >
      <BarPlot />
      <ChartsLegend />
      <ChartsTooltip />
      <ChartsAxis bottomAxis={{ axisId: DEFAULT_X_AXIS_KEY, disableLine: true }} />
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
      <div style={{ paddingTop: 10 }}>
        <RecordSelect state={year} label="Jahr" />
      </div>
    </>
  );
}

export function ParlamentGröße() {
  const years = electionsYears.filter((y) => Number.isFinite(y));
  const series = Object.entries(electionMethods).map(([methodName, method]) => {
    const data = years.map((year) => {
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
      xAxis={[{ data: years, valueFormatter: (v) => v.toString(), dataKey: 'jahr' }]}
      series={series}
      height={500}
    />
  );
}

export function ParteienZweitstimmen() {
  const parteien = mapRecord(partyColors, (_, party) => [] as number[]);
  const years = electionsYears.filter((y) => Number.isFinite(y));

  years.forEach((year) => {
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
      xAxis={[{ data: years, valueFormatter: (v) => v.toString(), dataKey: 'jahr' }]}
      series={series}
      height={500}
    />
  );
}

export function ÜberhangMandate() {
  const method = useRecordSelectState(
    {
      1956: election1956,
      2011: election2011,
      2013: election2013,
      2020: election2020,
    },
    '2011'
  );

  const parteien = mapRecord(partyColors, (_, party) => [] as number[]);
  const years = electionsYears.filter((y) => Number.isFinite(y));

  years.forEach((year) => {
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
        xAxis={[{ data: years, valueFormatter: (v) => v.toString(), dataKey: 'jahr' }]}
        series={series}
        height={500}
      />
      <div style={{ paddingTop: 10 }}>
        <RecordSelect state={method} label="Methode" />
      </div>
    </>
  );
}
