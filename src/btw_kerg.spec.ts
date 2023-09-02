import { describe, expect, it } from 'vitest';
import { electionsYears, getElectionData } from './btw_kerg';
import { CalculationContext, election1956 } from './calculate_election';
import { sainteLaguë } from './appointment_method';

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
        warnings: [],
      };
      const result = election1956(ctx);
      Object.keys(result).forEach(party => {
        expect(["CDU", "CSU", "SPD", "GRÜNE", "DIE LINKE", "AfD", "SSW", "FDP", "DP", "Zentrum", "GB/BHE", "PDS"]).toContain(party)
      })
    });
  });
});
