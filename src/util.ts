export function mapRecord<In, Out>(
  record: Record<string, In>,
  fn: (input: In, key: string) => Out
): Record<string, Out> {
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, fn(v, k)]));
}

export function mapListToRecord<T, Out>(list: T[], fn: (input: T) => Out): Record<string, Out> {
  return Object.fromEntries(list.map((x) => [x, fn(x)]));
}

export function filterRecord<V>(
  record: Record<string, V>,
  fn: (input: V, key: string) => boolean
): Record<string, V> {
  return Object.fromEntries(Object.entries(record).filter(([k, v]) => fn(v, k)));
}

export function transposeRecord<T>(
  record: Record<string, Record<string, T>>
): Record<string, Record<string, T>> {
  return mapListToRecord(innerRecordKeys(record), (kOuter) =>
    mapListToRecord(Object.keys(record), (kInner) => record[kInner][kOuter])
  );
}

export function innerRecordKeys<T>(record: Record<string, Record<string, T>>): string[] {
  let result = new Set<string>();
  Object.values(record).forEach((r) => {
    Object.keys(r).forEach((k) => result.add(k));
  });
  return [...result];
}

export function incrementInAccRecord(
  accRecord: Record<string, number>,
  key: string,
  amount: number
) {
  if (!(key in accRecord)) {
    accRecord[key] = 0;
  }
  accRecord[key] += amount;
}

export function sumRecord1D(record: Record<string, number>): number {
  return Object.values(record).reduce((a, b) => a + b, 0);
}

export function sumRecord2DAxis0(
  record: Record<string, Record<string, number>>
): Record<string, number> {
  return mapRecord(record as Record<string, Record<string, number>>, (x) =>
    Object.values(x).reduce((a, b) => a + b, 0)
  );
}

export function sumRecord2DAxis1(
  record: Record<string, Record<string, number>>
): Record<string, number> {
  const result: Record<string, number> = {};
  Object.values(record).forEach((subRecord) => {
    Object.entries(subRecord).forEach(([k, v]) => {
      incrementInAccRecord(result, k, v);
    });
  });
  return result;
}

export function max<T>(list: T[], acessor: (x: T) => number): T {
  let max = list[0];
  let maxValue = -Infinity;
  list.forEach((x) => {
    const v = acessor(x);
    if (v > maxValue) {
      max = x;
      maxValue = v;
    }
  });
  return max;
}
