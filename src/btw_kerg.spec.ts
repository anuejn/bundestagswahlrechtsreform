import { describe, expect, it } from 'vitest';
import { electionsYears, getElectionData } from './btw_kerg';
import { CalculationContext, election1956 } from './calculate_election';
import { sainteLaguë } from './appointment_method';
import { partyColors } from './parties';

describe('can parse', () => {
  electionsYears.forEach((year) => {
    it(`${year}`, () => {
      getElectionData(year);
    });
  });
});

describe('Has Correct Party Names', () => {
  electionsYears.forEach((year) => {
    it(`${year}`, () => {
      const ctx: CalculationContext = {
        ...getElectionData(year),
        apportionmentMethod: sainteLaguë,
        sitze: 598,
      };
      const result = election1956(ctx);
      Object.keys(result).forEach((party) => {
        expect(Object.keys(partyColors)).toContain(party);
      });
    });
  });
});
