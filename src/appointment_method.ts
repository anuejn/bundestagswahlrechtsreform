import { incrementInAccRecord } from './util';

export function sainteLaguë(input: Record<string, number>, seats: number): Record<string, number> {
  const result: Record<string, number> = {};

  while (Object.values(result).reduce((a, b) => a + b, 0) < seats) {
    let winner = Object.entries(input)[0];
    Object.entries(input).forEach((e) => {
      const quotient = ([name, votes]: [string, number]) => votes / (2 * (result[name] || 0) + 1);
      if (quotient(e) > quotient(winner)) {
        winner = e;
      }
    });
    incrementInAccRecord(result, winner[0], 1);
  }

  return result;
}
