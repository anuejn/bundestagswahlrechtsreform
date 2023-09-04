import { sainteLaguë } from './appointment_method';
import { ElectionData, Gebiet } from './btw_kerg';
import {
  filterRecord,
  incrementInAccRecord,
  mapListToRecord,
  mapRecord,
  max,
  sumRecord1D,
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
      Wahlberechtigten genutzt, was ähnliche aber nicht identische Ergebnisse produziert.
    `);
    const wahlberechtigte = Object.fromEntries(
      ctx.kerg.bundesländer.map((land) => [land.name, land.wahlberechtigte])
    );
    return ctx.apportionmentMethod(wahlberechtigte, ctx.sitze);
  }
}

export function getParteienÜberSperrklausel(
  ctx: CalculationContext,
  grundmandatsklausel: number | null = 3
): string[] {
  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);
  const zweitStimmenAlle = getZweitStimmen([ctx.kerg.bundesgebiet]);
  const wähler = ctx.kerg.bundesgebiet.wähler;
  return ctx.kerg.bundesgebiet.parteien
    .map((p) => p.name)
    .filter(
      (p) =>
        (grundmandatsklausel != null ? direktMandateBund[p] >= 3 : false) || // grundmandatsklauses
        (zweitStimmenAlle[p] / wähler) * 100 >= 5 || // 5%-Hürde
        minderheitenschutz.includes(p)
    );
}

export function getParteienImParlament(ctx: CalculationContext): string[] {
  const parteienÜberSperrklausel = getParteienÜberSperrklausel(ctx);
  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);
  return [...new Set([...Object.keys(direktMandateBund), ...parteienÜberSperrklausel])];
}

export function electionNurZweitstimmen(ctx: CalculationContext): Wahlergebniss {
  const parteienÜberSperrklausel = getParteienÜberSperrklausel(ctx);
  const zweitStimmen = filterRecord(getZweitStimmen(ctx.kerg.wahlkreise), (_, partei) =>
    parteienÜberSperrklausel.includes(partei)
  );
  const sitze = ctx.apportionmentMethod(zweitStimmen, ctx.sitze);
  return mapRecord(sitze, (sitze) => ({ sitze, direktMandate: 0, überhangMandate: 0 }));
}

/* the current reform we are interested in */
export function election2023(ctx: CalculationContext): Wahlergebniss {
  ctx.sitze = 630;
  const parteienÜberSperrklausel = getParteienÜberSperrklausel(ctx, null);
  const zweitStimmen = filterRecord(getZweitStimmen(ctx.kerg.wahlkreise), (_, partei) =>
    parteienÜberSperrklausel.includes(partei)
  );
  const sitze = ctx.apportionmentMethod(zweitStimmen, ctx.sitze);
  return mapRecord(sitze, (sitze) => ({ sitze, direktMandate: 0, überhangMandate: 0 }));
}

/* used in the 2021 election */
export function election2020(ctx: CalculationContext): Wahlergebniss {
  const parteienÜberSperrklausel = getParteienÜberSperrklausel(ctx);
  const parteienImParlament = getParteienImParlament(ctx);

  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);

  const zweitStimmenAlle = getZweitStimmen(ctx.kerg.wahlkreise);
  const zweitStimmenBund = filterRecord(zweitStimmenAlle, (_, k) =>
    parteienÜberSperrklausel.includes(k)
  );

  const länderSitze = getLänderSitze2013(ctx);

  const direktMandateLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    return getErststimmenSitze(wahlkreise);
  });

  const zweitStimmenSitzeLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    const zweitStimmen = filterRecord(getZweitStimmen(wahlkreise), (_, k) =>
      parteienÜberSperrklausel.includes(k)
    );
    return ctx.apportionmentMethod(zweitStimmen, landSitze);
  });

  const mindestzahlenLänder = mapRecord(länderSitze, (landSitze, land) => {
    const direktmandate = direktMandateLänder[land];
    const sitzeNachZweitStimmen = zweitStimmenSitzeLänder[land];
    return mapListToRecord(parteienÜberSperrklausel, (p) =>
      Math.max(
        Math.round(((direktmandate[p] || 0) + (sitzeNachZweitStimmen[p] || 0)) / 2),
        direktmandate[p] || 0
      )
    );
  });

  let zweitStimmenSitzeBund = ctx.apportionmentMethod(zweitStimmenBund, ctx.sitze);
  const mindestzahlenBund = mapRecord(sumRecord2DAxis1(mindestzahlenLänder), (m, k) =>
    Math.max(m, zweitStimmenSitzeBund[k] || 0)
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

  return mapListToRecord(parteienImParlament, (partei) => ({
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
  const parteienÜberSperrklausel = getParteienÜberSperrklausel(ctx);
  const parteienImParlament = getParteienImParlament(ctx);

  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);

  const zweitStimmenAlle = getZweitStimmen(ctx.kerg.wahlkreise);
  const zweitStimmenBund = filterRecord(zweitStimmenAlle, (_, k) =>
    parteienÜberSperrklausel.includes(k)
  );

  const länderSitze = getLänderSitze2013(ctx);

  const direktMandateLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    return getErststimmenSitze(wahlkreise);
  });

  const zweitStimmenSitzeLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    const zweitStimmen = filterRecord(getZweitStimmen(wahlkreise), (_, k) =>
      parteienÜberSperrklausel.includes(k)
    );
    return ctx.apportionmentMethod(zweitStimmen, landSitze);
  });

  const mindestzahlenLänder = mapRecord(länderSitze, (landSitze, land) =>
    mapListToRecord(parteienÜberSperrklausel, (p) =>
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

  return mapListToRecord(parteienImParlament, (partei) => ({
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
  const parteienÜberSperrklausel = getParteienÜberSperrklausel(ctx);
  const parteienImParlament = getParteienImParlament(ctx);
  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);
  const länderSitze = getLänderSitze2013(ctx);

  const direktMandateLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    return getErststimmenSitze(wahlkreise);
  });

  const zweitStimmenSitzeLänder = mapRecord(länderSitze, (landSitze, land) => {
    const wahlkreise = ctx.kerg.wahlkreise.filter((w) => w.land == land);
    const zweitStimmen = filterRecord(getZweitStimmen(wahlkreise), (_, k) =>
      parteienÜberSperrklausel.includes(k)
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

  ctx.sitze = sumRecord1D(mindestzahlenBund);
  return mapListToRecord(parteienImParlament, (partei) => ({
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
  const parteienÜberSperrklausel = getParteienÜberSperrklausel(ctx);
  const parteienImParlament = getParteienImParlament(ctx);

  const direktMandateBund = getErststimmenSitze(ctx.kerg.wahlkreise);
  const direktMandateEinzelbewerber = sumRecord1D(
    filterRecord(direktMandateBund, (mandate, partei) => !parteienÜberSperrklausel.includes(partei))
  );
  ctx.sitze -= direktMandateEinzelbewerber;

  const zweitStimmen = filterRecord(getZweitStimmen(ctx.kerg.wahlkreise), (_, k) =>
    parteienÜberSperrklausel.includes(k)
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
    return mapListToRecord(parteienImParlament, (partei) =>
      Math.max(sitzeParteien[partei] || 0, direktMandateLänder[land][partei] || 0)
    );
  });

  const überhangLänder = mapRecord(sitzeAufgeteilt, (sitzeParteien, land) =>
    mapListToRecord(parteienImParlament, (partei) =>
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

export const electionMethods = {
  1956: election1956,
  2011: election2011,
  2013: election2013,
  2020: election2020,
  2023: election2023,
  Zweitstimmen: electionNurZweitstimmen,
};
