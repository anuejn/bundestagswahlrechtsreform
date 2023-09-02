export type ElectionData = {
  wahlkreise: Gebiet[];
  bundesländer: Gebiet[];
  bundesgebiet: Gebiet;
};

export type Gebiet = {
  nr: number;
  name: string;
  land: string;
  wahlberechtigte: number;
  wähler: number;
  parteien: Partei[];
};

export type Partei = {
  name: string;
  erststimmen: number | null;
  zweitstimmen: number | null;
};

function isBundesgebiet(row: string[], headerFlat: string[]) {
  const name = row[headerFlat.findIndex((x) => x == 'Name')];
  return name.includes('Bundesgebiet');
}

function isBundesland(row: string[], headerFlat: string[]) {
  const nr = row[headerFlat.findIndex((x) => x == 'Nr')];
  const land = row[headerFlat.findIndex((x) => x == 'Land')];
  return ((nr.length == 3 && nr[0] == '9') || land == '99') && !isBundesgebiet(row, headerFlat);
}

function isWahlkreis(row: string[], headerFlat: string[]) {
  const nr = row[headerFlat.findIndex((x) => x == 'Nr')];

  return nr.length != 0 && !isBundesgebiet(row, headerFlat) && !isBundesland(row, headerFlat);
}

function parseIntOrNull(str: string) {
  return str ? parseInt(str) : null;
}

function parseGebiet(row: string[], header: string[][], headerFlat: string[]): Gebiet {
  const parteiNames = new Set(
    header
      .filter((h) => h.length == 2)
      .filter((h) => !['Übrige', 'Ungültige', 'Gültige'].includes(h[0]))
      .map((h) => h[0])
  );
  const parteien: Partei[] = [...parteiNames].map((name) => {
    const erststimmenIdx = header.findIndex((x) => x[0] == name && x[1] == 'Erststimmen');
    const erststimmen = erststimmenIdx == -1 ? null : parseIntOrNull(row[erststimmenIdx]);
    const zweitstimmenIdx = header.findIndex((x) => x[0] == name && x[1] == 'Zweitstimmen');
    const zweitstimmen = zweitstimmenIdx == -1 ? null : parseIntOrNull(row[zweitstimmenIdx]);

    return {
      name,
      erststimmen,
      zweitstimmen,
    };
  });

  return {
    nr: parseInt(row[headerFlat.findIndex((x) => x == 'Nr')]),
    name: row[headerFlat.findIndex((x) => x == 'Name')],
    land: row[headerFlat.findIndex((x) => x == 'Land')],
    wahlberechtigte: parseInt(row[headerFlat.findIndex((x) => x == 'Wahlberechtigte')]),
    wähler: parseInt(row[headerFlat.findIndex((x) => x == 'Wähler')]),
    parteien,
  };
}

function fixLänderField(election: ElectionData) {
  election.wahlkreise.forEach((wahlkreis) => {
    const shorthands: Record<string, string> = {
      BW: 'Baden-Württemberg',
      BY: 'Bayern',
      BE: 'Berlin',
      BB: 'Brandenburg',
      HB: 'Bremen',
      HH: 'Hamburg',
      HE: 'Hessen',
      MV: 'Mecklenburg-Vorpommern',
      NI: 'Niedersachsen',
      NW: 'Nordrhein-Westfalen',
      RP: 'Rheinland-Pfalz',
      SL: 'Saarland',
      SN: 'Sachsen',
      ST: 'Sachsen-Anhalt',
      SH: 'Schleswig-Holstein',
      TH: 'Thüringen',
    };
    const candidate = election.bundesländer.find(
      (bundesland) =>
        (bundesland.nr > 900 ? bundesland.nr - 900 : bundesland.nr).toString() == wahlkreis.land
    );
    if (candidate) {
      wahlkreis.land = candidate.name;
    } else if (wahlkreis.land in shorthands) {
      wahlkreis.land = shorthands[wahlkreis.land];
    } else {
      throw new Error(`couldn't parse Land ${wahlkreis.land} of wahlkreis ${wahlkreis.name}`);
    }
  });

  return election;
}

function parseElectionData(tsv: string): ElectionData {
  const lines = tsv.split('\n').map((l) => l.split('\t'));
  const [header1, header2, ...rest] = lines;
  const header = header1.map((h1, i) => [h1, header2[i]].filter((x) => x));
  const headerFlat = header.map((x) => x.join(' '));

  const wahlkreise: Gebiet[] = [];
  const bundesländer: Gebiet[] = [];
  const bundesgebiet: Gebiet[] = [];
  rest.forEach((row) => {
    const table = isBundesgebiet(row, headerFlat)
      ? bundesgebiet
      : isBundesland(row, headerFlat)
      ? bundesländer
      : isWahlkreis(row, headerFlat)
      ? wahlkreise
      : null;

    if (table) {
      table.push(parseGebiet(row, header, headerFlat));
    }
  });

  return fixLänderField({
    wahlkreise,
    bundesländer,
    bundesgebiet: bundesgebiet[0],
  });
}

const btw_kerg = import.meta.glob('../data_cleaned/*.csv', { as: 'raw', eager: true });
const einwohnerdaten = import.meta.glob('../data_cleaned/einwohnerdaten/*.json', { eager: true });

function getEntry(record: Record<string, any>, year: number): any {
  const path = Object.keys(record).find((path) => path.includes(year.toString())) || '';
  return record[path];
}

export function getElectionData(year: number): {
  kerg: ElectionData;
  einwohnerdaten: Record<string, number> | null;
} {
  return {
    kerg: parseElectionData(getEntry(btw_kerg, year)),
    einwohnerdaten: getEntry(einwohnerdaten, year)?.default || null,
  };
}
