import { describe, expect, it } from 'vitest';
import {
  CalculationContext,
  election1956,
  election2011,
  election2013,
  election2020,
  getLänderSitze2013,
} from './calculate_election';
import { hareNimeyer, sainteLaguë } from './appointment_method';
import { getElectionData } from './btw_kerg';

describe('election 2021', () => {
  const ctx: CalculationContext = {
    ...getElectionData(2021),
    apportionmentMethod: sainteLaguë,
    sitze: 598,
    warnings: [],
  };

  it('ländersitzeverteilung', () => {
    const result = getLänderSitze2013(ctx);
    expect(ctx.warnings).toEqual([]);
    expect(result).toEqual({
      'Schleswig-Holstein': 22,
      'Mecklenburg-Vorpommern': 13,
      Hamburg: 13,
      Niedersachsen: 59,
      Bremen: 5,
      Brandenburg: 20,
      'Sachsen-Anhalt': 17,
      Berlin: 24,
      'Nordrhein-Westfalen': 127,
      Sachsen: 32,
      Hessen: 43,
      Thüringen: 16,
      'Rheinland-Pfalz': 30,
      Bayern: 93,
      'Baden-Württemberg': 77,
      Saarland: 7,
    });
  });

  it('gesamtergebniss', () => {
    const result = election2020(ctx);
    expect(ctx.warnings).toEqual([]);
    expect(ctx.sitze).toEqual(736);
    expect(result).toEqual({
      'DIE LINKE': {
        sitze: 39,
        überhangMandate: 0,
        direktMandate: 3,
      },
      SPD: {
        sitze: 206,
        überhangMandate: 0,
        direktMandate: 121,
      },
      GRÜNE: {
        sitze: 118,
        überhangMandate: 0,
        direktMandate: 16,
      },
      SSW: {
        sitze: 1,
        überhangMandate: 0,
        direktMandate: 0,
      },
      CDU: {
        sitze: 152,
        überhangMandate: 0,
        direktMandate: 98,
      },
      CSU: {
        sitze: 45,
        überhangMandate: 3,
        direktMandate: 45,
      },
      FDP: {
        sitze: 92,
        überhangMandate: 0,
        direktMandate: 0,
      },
      AfD: {
        sitze: 83,
        überhangMandate: 0,
        direktMandate: 16,
      },
    });
  });
});

describe('election 2017', () => {
  const ctx: CalculationContext = {
    ...getElectionData(2017),
    apportionmentMethod: sainteLaguë,
    sitze: 598,
    warnings: [],
  };

  it('ländersitzeverteilung', () => {
    const result = getLänderSitze2013(ctx);
    expect(ctx.warnings).toEqual([]);
    expect(result).toEqual({
      'Schleswig-Holstein': 22,
      'Mecklenburg-Vorpommern': 13,
      Hamburg: 12,
      Niedersachsen: 59,
      Bremen: 5,
      Brandenburg: 19,
      'Sachsen-Anhalt': 18,
      Berlin: 24,
      'Nordrhein-Westfalen': 128,
      Sachsen: 32,
      Hessen: 43,
      Thüringen: 17,
      'Rheinland-Pfalz': 30,
      Bayern: 93,
      'Baden-Württemberg': 76,
      Saarland: 7,
    });
  });

  it('gesamtergebniss', () => {
    const result = election2013(ctx);
    expect(ctx.warnings).toEqual([]);
    expect(ctx.sitze).toEqual(709);
    expect(result).toEqual({
      'DIE LINKE': {
        sitze: 69,
        überhangMandate: 0,
        direktMandate: 5,
      },
      SPD: {
        sitze: 153,
        überhangMandate: 0,
        direktMandate: 59,
      },
      GRÜNE: {
        sitze: 67,
        überhangMandate: 0,
        direktMandate: 1,
      },
      CDU: {
        sitze: 200,
        überhangMandate: 0,
        direktMandate: 185,
      },
      CSU: {
        sitze: 46,
        überhangMandate: 0,
        direktMandate: 46,
      },
      FDP: {
        sitze: 80,
        überhangMandate: 0,
        direktMandate: 0,
      },
      AfD: {
        sitze: 94,
        überhangMandate: 0,
        direktMandate: 3,
      },
    });
  });
});

describe('election 2013', () => {
  const ctx: CalculationContext = {
    ...getElectionData(2013),
    apportionmentMethod: sainteLaguë,
    sitze: 598,
    warnings: [],
  };

  it('ländersitzeverteilung', () => {
    const result = getLänderSitze2013(ctx);
    expect(ctx.warnings).toEqual([]);
    expect(result).toEqual({
      'Schleswig-Holstein': 22,
      'Mecklenburg-Vorpommern': 13,
      Hamburg: 13,
      Niedersachsen: 59,
      Bremen: 5,
      Brandenburg: 19,
      'Sachsen-Anhalt': 18,
      Berlin: 24,
      'Nordrhein-Westfalen': 128,
      Sachsen: 32,
      Hessen: 43,
      Thüringen: 17,
      'Rheinland-Pfalz': 30,
      Bayern: 92,
      'Baden-Württemberg': 76,
      Saarland: 7,
    });
  });

  it('gesamtergebniss', () => {
    const result = election2013(ctx);
    expect(ctx.warnings).toEqual([]);
    expect(ctx.sitze).toEqual(631);
    expect(result).toEqual({
      'DIE LINKE': {
        sitze: 64,
        überhangMandate: 0,
        direktMandate: 4,
      },
      SPD: {
        sitze: 193,
        überhangMandate: 0,
        direktMandate: 58,
      },
      GRÜNE: {
        sitze: 63,
        überhangMandate: 0,
        direktMandate: 1,
      },
      CDU: {
        sitze: 255,
        überhangMandate: 0,
        direktMandate: 191,
      },
      CSU: {
        sitze: 56,
        überhangMandate: 0,
        direktMandate: 45,
      },
    });
  });
});

describe('election 2009', () => {
  const ctx: CalculationContext = {
    ...getElectionData(2009),
    apportionmentMethod: sainteLaguë,
    sitze: 598,
    warnings: [],
  };

  it('gesamtergebniss', () => {
    const result = election1956(ctx);
    expect(ctx.warnings).toEqual([]);
    expect(ctx.sitze).toEqual(622);
    expect(result).toEqual({
      'DIE LINKE': {
        sitze: 76,
        überhangMandate: 0,
        direktMandate: 16,
      },
      SPD: {
        sitze: 146,
        überhangMandate: 0,
        direktMandate: 64,
      },
      GRÜNE: {
        sitze: 68,
        überhangMandate: 0,
        direktMandate: 1,
      },
      CDU: {
        sitze: 194,
        überhangMandate: 21,
        direktMandate: 173,
      },
      CSU: {
        sitze: 45,
        überhangMandate: 3,
        direktMandate: 45,
      },
      FDP: {
        sitze: 93,
        überhangMandate: 0,
        direktMandate: 0,
      },
    });
  });
});

describe('election 2002', () => {
  const ctx: CalculationContext = {
    ...getElectionData(2002),
    apportionmentMethod: hareNimeyer,
    sitze: 598,
    warnings: [],
  };

  it('gesamtergebniss', () => {
    const result = election1956(ctx);
    expect(ctx.warnings).toEqual([]);
    expect(ctx.sitze).toEqual(603);
    expect(result).toEqual({
      SPD: {
        sitze: 251,
        überhangMandate: 4,
        direktMandate: 171,
      },
      GRÜNE: {
        sitze: 55,
        überhangMandate: 0,
        direktMandate: 1,
      },
      CDU: {
        sitze: 190,
        überhangMandate: 1,
        direktMandate: 82,
      },
      CSU: {
        sitze: 58,
        überhangMandate: 0,
        direktMandate: 43,
      },
      FDP: {
        sitze: 47,
        überhangMandate: 0,
        direktMandate: 0,
      },
      PDS: {
        sitze: 2,
        überhangMandate: 2,
        direktMandate: 2,
      },
    });
  });

  it('election1956 has PDS', () => {
    const result = election1956(ctx);
    expect(result).toHaveProperty('PDS');
  });

  it('election2011 has PDS', () => {
    const result = election2011(ctx);
    expect(result).toHaveProperty('PDS');
  });

  it('election2013 has PDS', () => {
    const result = election2013(ctx);
    expect(result).toHaveProperty('PDS');
  });

  it('election2020 has PDS', () => {
    const result = election2020(ctx);
    expect(result).toHaveProperty('PDS');
  });
});
