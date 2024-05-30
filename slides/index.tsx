import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/simple.css";
import RevealNotes from 'reveal.js/plugin/notes/notes';
import RevealZoom from 'reveal.js/plugin/zoom/zoom';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight';
import './a11y-light.css'
import { Presentation } from './presentation.tsx';
import './index.css'

function App() {
  const deckDivRef = useRef<HTMLDivElement>(null); // reference to deck container div
  const deckRef = useRef<Reveal.Api | null>(null); // reference to deck reveal instance

  useEffect(() => {
    // Prevents double initialization in strict mode
    if (deckRef.current) return;


    deckRef.current = new Reveal(deckDivRef.current!, {
      transition: "slide",
      controls: false,
      hash: true,

      minScale: 0.2,
      maxScale: 2.0,
      width: 960,
      height: 540,

    });
    deckRef.current.initialize({
      plugins: [RevealNotes, RevealZoom, RevealHighlight],
    })

    return () => {
      try {
        if (deckRef.current) {
          deckRef.current.destroy();
          deckRef.current = null;
        }
      } catch (e) {
        console.warn("Reveal.js destroy call failed.");
      }
    };
  }, []);

  return (
    // Your presentation is sized based on the width and height of
    // our parent element. Make sure the parent is not 0-height.
    <div className="reveal" ref={deckDivRef}>
      <div className="slides">
        <Presentation />
      </div>
    </div>
  );
}


window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});


if (window.opener) {
  document.addEventListener('mousemove', (event) => {
    const message = JSON.stringify({ namespace: 'mouse', args: [{ x: event.clientX, y: event.clientY }] });
    window.opener.postMessage(message, '*');
  });
} else {
  window.addEventListener("message", e => {
    if (typeof e.data != 'string') return;
    const data = JSON.parse(e.data);
    if (data.namespace == 'mouse') {
      const evt = new MouseEvent('mousemove', {
        ...data.args
      });
      window.dispatchEvent(evt);
    }
  }, false)
}

