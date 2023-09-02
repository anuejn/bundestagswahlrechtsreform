import { sainteLaguë } from './appointment_method';
import { ElectionData, Gebiet } from './btw_kerg';
import {
  filterRecord,
  incrementInAccRecord,
  mapListToRecord,
  mapRecord,
  max,
  sumRecord1D,
  sumRecord2DAxis0,
  sumRecord2DAxis1,
  transposeRecord,
} from './util';

const minderheitenschutz = ['SSW'];

export type CalculationContext = {
  kerg: ElectionData;
  einwohnerdaten: Record<string, number> | null;

  sitze: number;

  apportionmentMethod: typeof sainteLaguë;
  warnings: string[];
};

export type Wahlergebniss = Record<string, ParteiErgebniss>;

export type ParteiErgebniss = {
  sitze: number;
  direktMandate: number;
  überhangMandate: number;
};

function getErststimmenSitze(wahlkreise: Gebiet[]): Record<string, number> {
  const sitze: Record<string, number> = {};
  wahlkreise.forEach((wahlkreis) => {
    const winner = max(wahlkreis.parteien, (partei) => partei.erststimmen || 0);
    incrementInAccRecord(sitze, winner.name, 1);
  });

  return sitze;
}

function getZweitStimmen(gebiete: Gebiet[]): Record<string, number> {
  const result: Record<string, number> = {};
  gebiete.forEach((g) => {
    g.parteien.forEach((p) => {
      incrementInAccRecord(result, p.name, p.zweitstimmen || 0);
    });
  });
  return result;
}

export function getLänderSitze2013(ctx: CalculationContext): Record<string, number> {
  if (ctx.einwohnerdaten) {
    return ctx.apportionmentMethod(ctx.einwohnerdaten, ctx.sitze);
  } else {
    ctx.warnings.push(`
            Für die Gewählte Wahl sind keine Einwohnerdaten verfügbar.
            Stattdessen werden zur aufteilung der Sitze auf die Bundesländer Daten zu den
            Wahlberechtigten genutzt, was ähnliche aber nicht identische Ergebnisse produziert.`);
    const wahlberechtigte = Object.fromEntries(
      ctx.kerg.bundesländer.map((land) => [land.name, land.wahlberechtigte])
    );
    return ctx.apportionmentMethod(wahlberechtigte, ctx.sitze);
  }
}

/* used in the 2021 election */
export function election2020(ctx: CalculationContext): Wahlergebniss {
  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);
  const zweitStimmenAlle = getZweitStimmen(ctx.kerg.wahlkreise);
  const wähler = ctx.kerg.bundesgebiet.wähler;
  const parteienImParlament = ctx.kerg.bundesgebiet.parteien
    .map((p) => p.name)
    .filter(
      (p) =>
        direktMandateBund[p] >= 3 || // grundmandatsklauses
        (zweitStimmenAlle[p] / wähler) * 100 >= 5 || // 5%-Hürde
        minderheitenschutz.includes(p)
    );
  const parteien = [...new Set([...Object.keys(direktMandateBund), ...parteienImParlament])];
  const zweitStimmenBund = filterRecord(zweitStimmenAlle, (_, k) =>
    parteienImParlament.includes(k)
  );

  const länderSitze = getLänderSitze2013(ctx);

  const direktMandateLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    return getErststimmenSitze(wahlkreise);
  });

  const zweitStimmenSitzeLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    const zweitStimmen = filterRecord(getZweitStimmen(wahlkreise), (_, k) =>
      parteienImParlament.includes(k)
    );
    return ctx.apportionmentMethod(zweitStimmen, landSitze);
  });

  const mindestzahlenLänder = mapRecord(länderSitze, (landSitze, land) => {
    const direktmandate = direktMandateLänder[land];
    const sitzeNachZweitStimmen = zweitStimmenSitzeLänder[land];
    return mapListToRecord(parteienImParlament, (p) =>
      Math.max(
        Math.round(((direktmandate[p] || 0) + (sitzeNachZweitStimmen[p] || 0)) / 2),
        direktmandate[p] || 0
      )
    );
  });

  let zweitStimmenSitzeBund = ctx.apportionmentMethod(zweitStimmenBund, ctx.sitze);
  const mindestzahlenBund = mapRecord(sumRecord2DAxis1(mindestzahlenLänder), (m, k) =>
    Math.max(m, zweitStimmenSitzeBund[k])
  );
  const mindestgröße = sumRecord1D(mindestzahlenBund);
  ctx.sitze = mindestgröße;

  while (true) {
    zweitStimmenSitzeBund = ctx.apportionmentMethod(zweitStimmenBund, ctx.sitze);
    const überhangBund = mapRecord(zweitStimmenSitzeBund, (sitze, partei) =>
      Math.max(0, (direktMandateBund[partei] || 0) - (sitze || 0))
    );
    const überhangTotal = sumRecord1D(überhangBund);
    if (überhangTotal <= 3) {
      ctx.sitze += überhangTotal;
      break;
    } else {
      ctx.sitze += 1;
    }
  }

  return mapListToRecord(parteien, (partei) => ({
    sitze: Math.max(zweitStimmenSitzeBund[partei] || 0, direktMandateBund[partei] || 0),
    direktMandate: direktMandateBund[partei] || 0,
    überhangMandate: Math.max(
      0,
      (direktMandateBund[partei] || 0) - (zweitStimmenSitzeBund[partei] || 0)
    ),
  }));
}

/* used in the elections 2013 + 2017 */
export function election2013(ctx: CalculationContext): Wahlergebniss {
  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);
  const zweitStimmenAlle = getZweitStimmen(ctx.kerg.wahlkreise);
  const wähler = ctx.kerg.bundesgebiet.wähler;
  const parteienImParlament = ctx.kerg.bundesgebiet.parteien
    .map((p) => p.name)
    .filter(
      (p) =>
        direktMandateBund[p] >= 3 || // grundmandatsklauses
        (zweitStimmenAlle[p] / wähler) * 100 >= 5 || // 5%-Hürde
        minderheitenschutz.includes(p)
    );
  const parteien = [...new Set([...Object.keys(direktMandateBund), ...parteienImParlament])];

  const zweitStimmenBund = filterRecord(zweitStimmenAlle, (_, k) =>
    parteienImParlament.includes(k)
  );

  const länderSitze = getLänderSitze2013(ctx);

  const direktMandateLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    return getErststimmenSitze(wahlkreise);
  });

  const zweitStimmenSitzeLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    const zweitStimmen = filterRecord(getZweitStimmen(wahlkreise), (_, k) =>
      parteienImParlament.includes(k)
    );
    return ctx.apportionmentMethod(zweitStimmen, landSitze);
  });

  const mindestzahlenLänder = mapRecord(länderSitze, (landSitze, land) =>
    mapListToRecord(parteienImParlament, (p) =>
      Math.max(direktMandateLänder[land][p] || 0, zweitStimmenSitzeLänder[land][p] || 0)
    )
  );

  let zweitStimmenSitzeBund = ctx.apportionmentMethod(zweitStimmenBund, ctx.sitze);
  const mindestzahlenBund = sumRecord2DAxis1(mindestzahlenLänder);
  const mindestgröße = sumRecord1D(mindestzahlenBund);
  ctx.sitze = mindestgröße;

  while (true) {
    zweitStimmenSitzeBund = ctx.apportionmentMethod(zweitStimmenBund, ctx.sitze);
    if (
      Object.entries(mindestzahlenBund).every(
        ([partei, mindestzahl]) => zweitStimmenSitzeBund[partei] >= mindestzahl
      )
    ) {
      break;
    } else {
      ctx.sitze += 1;
    }
  }

  return mapListToRecord(parteien, (partei) => ({
    sitze: Math.max(zweitStimmenSitzeBund[partei] || 0, direktMandateBund[partei] || 0),
    direktMandate: direktMandateBund[partei] || 0,
    überhangMandate: Math.max(
      0,
      (direktMandateBund[partei] || 0) - (zweitStimmenBund[partei] || 0)
    ),
  }));
}

/* never used, was declared unlawful by BverfG before the next election */
export function election2011(ctx: CalculationContext): Wahlergebniss {
  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);
  const zweitStimmenAlle = getZweitStimmen(ctx.kerg.wahlkreise);
  const wähler = ctx.kerg.bundesgebiet.wähler;
  const parteienImParlament = ctx.kerg.bundesgebiet.parteien
    .map((p) => p.name)
    .filter(
      (p) =>
        direktMandateBund[p] >= 3 || // grundmandatsklauses
        (zweitStimmenAlle[p] / wähler) * 100 >= 5 || // 5%-Hürde
        minderheitenschutz.includes(p)
    );
  const parteien = [...new Set([...Object.keys(direktMandateBund), ...parteienImParlament])];

  const länderSitze = getLänderSitze2013(ctx);

  const direktMandateLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    return getErststimmenSitze(wahlkreise);
  });

  const zweitStimmenSitzeLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    const zweitStimmen = filterRecord(getZweitStimmen(wahlkreise), (_, k) =>
      parteienImParlament.includes(k)
    );
    return ctx.apportionmentMethod(zweitStimmen, landSitze);
  });

  const mindestzahlenLänder = mapRecord(länderSitze, (landSitze, land) =>
    mapListToRecord(parteienImParlament, (p) =>
      Math.max(direktMandateLänder[land][p] || 0, zweitStimmenSitzeLänder[land][p] || 0)
    )
  );
  const mindestzahlenBund = sumRecord2DAxis1(mindestzahlenLänder);

  // We do not implement Reststimmenverwertung because according to wikipedia it is unclear how it works
  // TODO: we could try to guess some random implementation here

  return mapListToRecord(parteien, (partei) => ({
    sitze: Math.max(mindestzahlenBund[partei] || 0, direktMandateBund[partei] || 0),
    direktMandate: direktMandateBund[partei] || 0,
    überhangMandate: Math.max(
      0,
      (direktMandateBund[partei] || 0) - (mindestzahlenBund[partei] || 0)
    ),
  }));
}

/* used from 1956 - 2011; can also be used for 53 with a modified sperrklausel */
export function election1956(ctx: CalculationContext): Wahlergebniss {
  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);
  const zweitStimmenAlle = getZweitStimmen(ctx.kerg.wahlkreise);
  const wähler = ctx.kerg.bundesgebiet.wähler;
  const parteienImParlament = ctx.kerg.bundesgebiet.parteien
    .map((p) => p.name)
    .filter(
      (p) =>
        direktMandateBund[p] >= 3 || // grundmandatsklausel
        (zweitStimmenAlle[p] / wähler) * 100 >= 5 || // 5%-Hürde
        minderheitenschutz.includes(p)
    );
  const parteien = [...new Set([...Object.keys(direktMandateBund), ...parteienImParlament])];

  const direktMandateEinzelbewerber = sumRecord1D(
    filterRecord(direktMandateBund, (mandate, partei) => !parteienImParlament.includes(partei))
  );
  ctx.sitze -= direktMandateEinzelbewerber;

  const zweitStimmen = filterRecord(getZweitStimmen(ctx.kerg.wahlkreise), (_, k) =>
    parteienImParlament.includes(k)
  );
  const sitzeBundOhneÜberhang = ctx.apportionmentMethod(zweitStimmen, ctx.sitze);
  const länder = Object.fromEntries(
    ctx.kerg.bundesländer.map((land) => [
      land.name,
      Object.fromEntries(land.parteien.map((partei) => [partei.name, partei])),
    ])
  );
  const länderTransposed = transposeRecord(länder);
  const sitzeAufgeteiltTransposed = mapRecord(sitzeBundOhneÜberhang, (sitze, partei) =>
    ctx.apportionmentMethod(
      mapRecord(länderTransposed[partei], (p) => p.zweitstimmen || 0),
      sitze
    )
  );
  const sitzeAufgeteilt = transposeRecord(sitzeAufgeteiltTransposed);

  const direktMandateLänder = mapRecord(länder, (_, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    return getErststimmenSitze(wahlkreise);
  });

  const sitzeLänder = mapRecord(sitzeAufgeteilt, (sitzeParteien, land) => {
    return mapListToRecord(parteien, (partei) =>
      Math.max(sitzeParteien[partei] || 0, direktMandateLänder[land][partei] || 0)
    );
  });

  const überhangLänder = mapRecord(sitzeAufgeteilt, (sitzeParteien, land) =>
    mapListToRecord(parteien, (partei) =>
      Math.max(0, (direktMandateLänder[land][partei] || 0) - (sitzeParteien[partei] || 0))
    )
  );
  const überhangBund = sumRecord2DAxis1(überhangLänder);
  const sitzeBund = sumRecord2DAxis1(sitzeLänder);

  ctx.sitze = sumRecord1D(sitzeBund);
  return mapRecord(sitzeBund, (sitze, partei) => ({
    sitze: sitze,
    direktMandate: direktMandateBund[partei] || 0,
    überhangMandate: überhangBund[partei],
  }));
}
