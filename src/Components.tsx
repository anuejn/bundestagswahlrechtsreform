import * as React from 'react';
import { HTMLProps, useEffect, useMemo, useState } from 'react';
import sources from './btw.json';
import { ElectionData, parseElectionData } from './btw_kerg';

let sn_count = 0;
export function SideNote({ children }: { children: React.ReactNode }) {
  const id = useMemo(() => {
    sn_count += 1;

    return `sn-${sn_count}`;
  }, []);

  return (
    <>
      <label htmlFor={id} className={'margin-toggle sidenote-number'} />
      <input type="checkbox" id={id} className={'margin-toggle'} />
      <span className="sidenote">{children}</span>
    </>
  );
}

export function Wahl() {
  const data = useMemo(async () => {
    console.log(btw_kerg);
    console.log(einwohnerdaten);
    const text = await (await fetch(sources[2021])).text();
    const election = parseElectionData(text);
    console.log(election);
    console.log(getErststimmenSitze(election));
    console.log(
      sainteLaguë(
        Object.fromEntries(election.bundesländer.map((land) => [land.name, land.wahlberechtigte])),
        598
      )
    );
    console.log(sainteLaguë(einwohnerdaten, 598));
  }, []);

  return <></>;
}
