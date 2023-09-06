import { ParteiErgebniss, Wahlergebniss } from './calculate_election';

export const partyColors = {
  SSW: 'rgb(0, 48, 114)',
  'DIE LINKE': '#BE3075',
  PDS: '#BE3075',
  SPD: '#E3010F',
  GRÜNE: '#64A12D',
  FDP: '#FFED00',
  CDU: '#161A1D',
  CSU: '#777',
  Zentrum: '#000000',
  DP: 'rgb(0, 0, 204)',
  'GB/BHE': 'rgb(156, 156, 19)',
  AfD: '#009EE0',
};

export function partiesSorted(
  parties: Wahlergebniss
): (ParteiErgebniss & { name: string; color: string })[] {
  return Object.entries(parties)
    .map(([name, rest]) => ({
      name,
      ...rest,
      color: partyColors[name as keyof typeof partyColors],
    }))
    .sort(
      (a, b) =>
        Object.keys(partyColors).findIndex((x) => x == a.name) -
        Object.keys(partyColors).findIndex((x) => x == b.name)
    );
}
