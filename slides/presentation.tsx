import React from "react";
import {
  Wahl,
  WahlSelectable,
  WahlDiffSelectable,
  ParlamentGröße,
  ParteienZweitstimmen,
  ÜberhangMandate,
  ÜberhangMandateTotal,
  AnteilVergleich,
} from '../src/ElectionCharts';
import { election2020 } from '../src/calculate_election';
import { Caption, Remark, SvgAnimation } from './components'


export function Presentation({ }) {
  return (<>

    <section>
    <section>
        <h3>Wer sind die Gewinner der Bundestagswahlrechtsreform?</h3>
      </section>
      <section>
        <img src="./xkcd-356.png" className="r-stretch" />
        <Remark>CC BY-NC 2.5 - https://xkcd.com/356</Remark>
      </section>
    </section>

    <section>
      <section>
        <img className="r-stretch" src="./wahlzettel.png" />
        <Remark>Girwidz, CC BY-SA 4.0, via Wikimedia Commons</Remark>
      </section>

      <section>
        <img src="./wahlzettel.png" />
      </section>

      <section>
        <Wahl year={2021} method={election2020} />
        <h3 className="r-fit-text">Sitzverteilung des 20. Deutschen Bundestages.</h3>
        <Remark>Der SSW ist in allen Diagrammen für bessere Sichtbarkeit größer dargestellt.</Remark>
      </section>
    </section>

    <WarumUndWie />

    <History />
    <Reform2023 />

    <Alternativen />

    <section>
      <h3>Fazit</h3>

      <aside className="notes">
        * Eingangsfrage<br />
        * Linkspartei zerlegt hat: Auch egal<br />
      </aside>
    </section>

    <section>
      <h3>Vielen Dank!</h3>
      <a href="https://anuejn.github.io/bundestagswahlrechtsreform/">https://anuejn.github.io/bundestagswahlrechtsreform/</a>
    </section>

    <Sitzzuteilungsverfahren />
  </>);
}


export function WarumUndWie() {
  return <section>
    <section>
      <h3>Artikel 38 GG:</h3>

      <blockquote>
        Die Abgeordneten des Deutschen Bundestages werden in
        <span className="fragment b"> allgemeiner, </span><span className="fragment b">unmittelbarer, </span>
        <span className="fragment b">freier, </span><span className="fragment b">gleicher, </span>
        und <span className="fragment b">geheimer </span>Wahl gewählt
      </blockquote>

    </section>


    <section>
      <h3 className="r-fit-text">Wer darf wählen?</h3>

      <aside className="notes">
        * Herabsetzung der Altersgrenze für das aktive Wahlrecht
        auf 18 Jahre 1972 <br />
        * Aufhebung verschiedener Gründe für den
        Wahlrechtsausschluss (z.B. für Personen, die im Gefängnis sitzen).<br />
        Immer noch dürfen
        viele Einwohner:innen Deutschlands nicht wählen z.B. wegen prekären Aufenthaltsverhältnissen. <br />
        * 83 237 124 Einwohner <br />
        * Alter 13,9 Mio <br />
        * 8,1 wegen anderen Gründen <br />
        * 61,18 Mio durften 2021 Wählen <br />
        * 14,32 Mio wollten nicht <br />
        * 46,86 Haben gewählt <br />
      </aside>
    </section>
  </section>
}

export function History() {
  return <section>
    <section >
      <h3 className="r-fit-text">Geschichte</h3>
    </section>
    <section>
      <h3 className="r-fit-text">1949</h3>
    </section>
    <section >
      <h3 className="r-fit-text">1953</h3>
    </section>
    <section >
      <h3 className="r-fit-text">1956</h3>
    </section>
    <section >
      <SvgAnimation src="./svv1956.excalidraw.svg" until={11} />
    </section>

    <section >
      <h3>Sitzzuteilungsverfahren</h3>
      <ul>
        <li className="fragment">10 Sitze zu vergeben</li>
        <li className="fragment"><i>A</i> hat 55 Stimmen</li>
        <li className="fragment"><i>B</i> hat 45 Stimmen</li>
        <li className="fragment">Wer bekommt wie viele Sitze?</li>
      </ul>
    </section>

    <section>
      <img src="./dreisatz.svg" className="r-stretch" />
    </section>


    <section >
      <h3>Sitzzuteilungsverfahren</h3>
      <ul>
        <li className="">10 Sitze zu vergeben</li>
        <li className=""><i>A</i> hat 55 Stimmen</li>
        <li className=""><i>B</i> hat 45 Stimmen</li>
        <li className="">Wer bekommt wie viele Sitze?</li>
      </ul>
      <aside className="notes">
        * Sainte lague: 6 und 4
      </aside>
    </section>

    <section>
      <SvgAnimation src="./svv1956.excalidraw.svg" from={12} />

      <aside className="notes">
        * Was sind überhangmandate!!<br />
        * Was ist grundmandatsklausel!!<br />
      </aside>
    </section>

    <section>
      <h1 className="r-fit-text">03. Juli 2008</h1>
      <h3 className="r-fit-text fragment">BVerfG: Verfassungswiedrig!</h3>
      <h3 className="r-fit-text fragment">Negatives Stimmgewicht</h3>

      <aside className="notes">
        * verletzt Gleichheit und Unmittelbarkeit<br />
      </aside>
    </section>
    <section>
      <h1 className="r-fit-text">Bundestagswahl 2005</h1>
      <h1 className="r-fit-text fragment">(Angela Merkel wird Bundeskanzlerin)</h1>
      <aside className="notes">
        * Im Wahlkreis Dresden I in Sachsen verstarb der Direktkandidat der rechtsextremen NPD zwischen Bekanntgabe seiner Kandidatur und der Wahl<br />
        * Nachwahl<br />
        * CDU insgesamt einen Parlamentssitz mehr bekommt, wenn sie im besagtem Wahlkreis mit weniger Zweitstimmen gewählt wird<br />
        * Warum?<br />
      </aside>
    </section>
    <section>
      <SvgAnimation src="./svv1956.excalidraw.svg" from={20} />
      <aside className="notes">
        * Die CDU hatte in Sachsen bei der Bundestagswahl 2005 mehr Direktmandate als sie Listenmandate hätte.<br />
        * Aufgegessen<br />
        <br />
        * Frist bis zum 30. Juni 2011 um das Bundestagswahlrecht zu reformieren<br />
        * Verpasst<br />
        * 3. Dezember 2011 ein Gesetzentwurf von der CDU/CSU und FDP verabschiedet<br />
      </aside>
    </section>
    <section>
      <h3 className="r-fit-text">2011</h3>
    </section>
    {/*
    <section>
      <img src="./svv2011.excalidraw.svg" alt="" />
      <aside className="notes">
        * keine reststimmenverwertung<br />
        * publikation: Endgültige Sitzberechnung und Verteilung der Mandate der Bundeswahlleiterin<br />
      </aside>
    </section>
    */}
    <section>
      <h3 className="r-fit-text">Am 25. Juli 2012 vom BverfG gekippt</h3>
      <h3 className="r-fit-text fragment">Immer noch negatives Stimmgewicht</h3>
      <h3 className="r-fit-text fragment">Zu viele Überhangmandate</h3>
      <aside className="notes">
        * Überhangmandate (§ 6 Abs. 5 BWG) nur in einem Umfang hinnehmbar, der den Grundcharakter der Wahl als einer Verhältniswahl nicht aufhebt.<br />
        * Umfang von mehr als etwa einer halben Fraktionsstärke verletzt (ca. 15 Mandate)<br />
      </aside>
    </section>

    <section>
      <ÜberhangMandateTotal />
      <aside className="notes">
        Unausgeglichene Überhangmandate.<br />
        <br />
        Da sich die Wahlsysteme von 2011, 2013 und 2020 hauptsächlich im Ausgleich der Überhangmandate unterscheiden, ist die Betrachtung von 2011 die interessanteste für die ursächliche Bestimmung der Überhangmandate dieser Gruppe von Wahlsystemen.
      </aside>
    </section>

    <section>
      <ÜberhangMandate />

      <aside className="notes">
        Unausgeglichene Überhangmandate.<br />
        <br />
        Da sich die Wahlsysteme von 2011, 2013 und 2020 hauptsächlich
        im Ausgleich der Überhangmandate unterscheiden, ist die Betrachtung von 2011 die interessanteste für die ursächliche Bestimmung der Überhangmandate dieser Wahlsysteme.
        <br /><br />
        Rückgang der Volksparteien: Meisten direktmandate, nicht gedeckt durch zweitstimmen
      </aside>
    </section>

    <section>
      <h3 className="r-fit-text">2013</h3>
    </section>

    <section>
      <SvgAnimation src="./svv2013.excalidraw.svg" until={25} />
      <aside className="notes">
        hat länger gehalten: 2013 + 2017
      </aside>
    </section>


    <section>
      <h3 className="r-fit-text">Große Parlamente</h3>
      <aside className="notes">
        ausnahmsweise nicht Bverfg
      </aside>
    </section>


    <section>
      <ParlamentGröße />

      <aside className="notes">
        Vergleich der Parlamentsgrößenentwicklung mit den verschiedenen Berechnungsmethoden.<br />
        <br />

        Das Sitzverteilungsverfahren „SVVZweitstimmen“ ist ein imaginäres Verfahren, welches immer die Zielgröße des Bundestages (doppelte Anzahl Wahlkreise) proportional nach Zweitstimmen aufteilt.
      </aside>
    </section>


    <section>
      <h3 className="r-fit-text">Warum?</h3> {/* schlechte grafikreihenfolge */}
    </section>

    <section>
      <ParteienZweitstimmen />
    </section>


    <section>
      <h3 className="r-fit-text">2020</h3>
    </section>

    <section>
      <img src="./reform.svg" className="r-stretch" />
    </section>

    <section>
      <SvgAnimation src="./svv2013.excalidraw.svg" from={30} />
      <aside className="notes">
        Bverfg klage von BÜNDNIS 90/DIE GRÜNEN, DIE LINKE und FDP am 29. November 2023 zurückgewiesen
      </aside>
    </section>

  </section>
}

export function Reform2023() {
  return <><section>
    <section>
      <h3 className="r-fit-text">2023</h3>
    </section>

    <section>
      <SvgAnimation src="./svv2023.excalidraw.svg" />
      <aside className="notes">
        * Erststimmenanteil = erhaltene erststimmen / gültige abgegebene erststimmen
      </aside>
    </section>

    <section>
      <section>
        <h3>Radikaler Umbau!</h3>
        <ul>
          <li className="fragment">Keine Grundmandatsklausel</li>
          <li className="fragment">Wahlkreise ohne Direktmandat</li>
          <li className="fragment">Keine flexible Parlamentsgröße</li>
        </ul>
      </section>
    </section>

    <section>
      <img src="./montagslächeln.png" alt="" />
      <Remark>Quelle: blog.campact.de / montagslächeln / Kostas Koufogiorgos, Toonpool </Remark>
    </section>

    <section>
      <ParteienZweitstimmen />
    </section>


  </section>
    <section>
      <section>
        <h3>Auswirkungen untersuchen</h3>
      </section>

      <section>
        <h3>Selbst nachrechnen!</h3>
        <div className="r-stack">
          <img src="./code.png" className="fragment r-stretch" />
          <img src="./tests.png" className="fragment r-stretch" />
        </div>

      </section>

      <section>
        <h3>Open Data der Bundeswahlleiterin</h3>
      </section>

      <section>
        <img src="./btw_kerg.svg" className="r-stretch" />
        <aside className="notes">
          * inkonsistentes format
          * inkonsistente parteinamen
          * fehlende daten (einwohner*innen pro land)
        </aside>
      </section>

      <section>
        <WahlSelectable />
        <aside className="notes">
          Sitzverteilungen mit verschiedenen Berechnungsmethoden.
        </aside>
      </section>


      <section>
        <WahlDiffSelectable />

        {/* Durchgehende linien */}

        <aside className="notes">
          Vergleich der Ergebnisse der Sitzverteilungsverfahren mit einer Sitzverteilung nach reinem Zweitstimmenergebnis bei gleicher Parlamentsgröße.
        </aside>
      </section>

      <section>
        <AnteilVergleich />
        <aside className="notes">
          Unterschied des prozentualen Anteils der Sitze der Parteien im Bundestag bei Verwendung verschiedener Sitzzuteilungsverfahren.
        </aside>
      </section>


      <section>
        <h3>Sind Wahlrechtsreformen die deutsche Form des Gerrymanderings?</h3>
      </section>


      <section>
        <h3>Nein.<span className="fragment">.</span><span className="fragment">.</span></h3>
      </section>
    </section>
  </>
}

export function Alternativen({ }) {
  return <section>
    <section>
      <h3>Alternativen</h3>
    </section>

    <section>
      <h3>Anzahl der Wahlkreise reduzieren</h3>
    </section>
    <section>
      <h3>Anzahl unausgeglichener Überhangmandate erhöhen</h3>
    </section>
    <section>
      <h3>Überhangmandate über Bundesländergrenzen hinweg ausgleichen</h3>
    </section>
    <section>
      <h3>Einen Großen Bundestag akzeptieren</h3>
    </section>
  </section>
}

export function Sitzzuteilungsverfahren({ }) {
  return <>
    <section>
      <section>
        <h3>Sitzzuteilungsverfahren: Bonus slides</h3>
      </section>

      <section data-auto-animate>
        <pre data-id="code-animation"><code className="python" data-trim data-line-numbers="1-7|1|2|3|4-6|1-7">{`
          def d_hondt(votes: ArrayLike, seats: int):
              assigned_seats = np.zeros_like(votes)
              while sum(assigned_seats) < seats:
                  scores = votes / (assigned_seats + 1)
                  to_increment = scores.index(max(scores))
                  assigned_seats[to_increment] += 1
              return assigned_seats
        `}</code></pre>
      </section>

      <section data-auto-animate>
        <pre data-id="code-animation"><code className="python" data-trim data-line-numbers>{`
          def sainte_laguë(votes: ArrayLike, seats: int):
              assigned_seats = np.zeros_like(votes)
              while sum(assigned_seats) < seats:
                  scores = votes / (2 * assigned_seats + 1)
                  to_increment = scores.index(max(scores))
                  assigned_seats[to_increment] += 1
              return assigned_seats
        `}</code></pre>
      </section>

      <section data-auto-animate>
        <pre data-id="code-animation"><code className="python" data-trim data-line-numbers="1-7|2|3|5-7|1-8">{`
          def hare_nimeyer(votes: ArrayLike, seats: int):
              assigned_seats = np.floor((votes * seats) / sum(votes))
              rest = (votes * seats) / sum(votes) - assigned_seats
              while sum(assigned_seats) < seats:
                  to_increment = rest.index(max(rest))
                  rest[to_increment] = 0
                  assigned_seats[to_increment] += 1
              return assigned_seats
        `}</code></pre>
      </section>
    </section>
  </>
}

