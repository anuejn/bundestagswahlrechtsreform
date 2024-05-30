import React, { useEffect, useRef, useState } from "react";

let fig_count = 1;
export function Caption({ children }: { children: (JSX.Element | string)[] | JSX.Element | string }) {
  const childrenList = Array.isArray(children) ? [...children] : [children];
  console.log(childrenList)
  const jsxChildrenList = childrenList.map(s => typeof s == "string" ? <>{s}</> : s);
  jsxChildrenList[0] = (
    <p>
      <b>
        <i>Abbildung {fig_count++}:</i> {jsxChildrenList[0].props.children}
      </b>
    </p>
  );

  return <div className="caption">{jsxChildrenList.map((x, i) => ({ ...x, key: i }))}</div>;
}

export function Remark({ children }: { children: string | JSX.Element | JSX.Element[] }) {
  return <p className="remark">{children}</p>
}

export function SvgAnimation({ src, from, until }: { src: string, from?: number, until?: number }) {
  const child = useRef<HTMLDivElement>(null);
  useEffect(() => {
    (async () => {
      const res = await fetch(src);
      const text = await res.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, "image/svg+xml");
      const svgElement = svgDoc.children[0] as SVGElement;
      svgElement.classList.add("r-stretch")
      svgElement.removeAttribute("width")
      svgElement.removeAttribute("height")

      const elements = svgElement.getElementsByTagName(
        "*",
      ) as HTMLCollectionOf<SVGElement>;
      for (const element of elements) {
        const elementLabel = element.getAttribute("inkscape:label");
        const fragmentNo = elementLabel?.match(/^(\d+)$/)
        if (fragmentNo && elementLabel) {
          const fragmentNoInt = parseInt(fragmentNo[1]);
          if (until && fragmentNoInt > until) {
            element.style.display = 'none';
          } else if (fragmentNoInt >= (from || 0)) {
            element.classList.add("fragment")
            element.setAttribute("data-fragment-index", elementLabel)
          }
        }
      }

      child.current?.replaceChildren(svgElement);
    })();
  }, [src, child.current])

  return <div ref={child}></div>
}