import { incrementInAccRecord, mapRecord, max, sumRecord1D } from './util';

function cachedAppointmentMethod(method: typeof sainteLaguëUncached): typeof sainteLaguëUncached {
  const cache: Record<string, Record<string, number>> = {};

  return (input, seats) => {
    const key = JSON.stringify({ input, seats });
    if (!(key in cache)) {
      cache[key] = method(input, seats);
    }
    return cache[key];
  };
}

function sainteLaguëUncached(input: Record<string, number>, seats: number): Record<string, number> {
  const result: Record<string, number> = {};
  while (sumRecord1D(result) < seats) {
    let winner = max(
      Object.entries(input),
      ([name, votes]: [string, number]) => votes / (2 * (result[name] || 0) + 1)
    );
    incrementInAccRecord(result, winner[0], 1);
  }
  return result;
}
export const sainteLaguë = cachedAppointmentMethod(sainteLaguëUncached);

export function hareNimeyer(input: Record<string, number>, seats: number): Record<string, number> {
  const totalVotes = sumRecord1D(input);
  const result: Record<string, number> = mapRecord(input, (votes) =>
    Math.floor((votes * seats) / totalVotes)
  );
  const rest: Record<string, number> = mapRecord(
    input,
    (votes, k) => (votes * seats) / totalVotes - result[k]
  );

  while (sumRecord1D(result) < seats) {
    const selected = max(Object.entries(rest), ([k, v]) => v);
    delete rest[selected[0]];
    incrementInAccRecord(result, selected[0], 1);
  }

  return result;
}

export function DHondt(input: Record<string, number>, seats: number): Record<string, number> {
  const result: Record<string, number> = {};
  while (sumRecord1D(result) < seats) {
    let winner = max(
      Object.entries(input),
      ([name, votes]: [string, number]) => votes / ((result[name] || 0) + 1)
    );
    incrementInAccRecord(result, winner[0], 1);
  }
  return result;
}
