import React, { useMemo } from 'react';

let sn_count = 0;
export function SideNote({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: React.ReactNode;
}) {
  const id = useMemo(() => {
    sn_count += 1;

    return `sn-${sn_count}`;
  }, []);

  return (
    <>
      <label htmlFor={id} className={'margin-toggle ' + (label ? '' : 'sidenote-number')}>
        {label}
      </label>
      <input type="checkbox" id={id} className={'margin-toggle'} />
      <span className={label ? 'marginnote' : 'sidenote'}>{children}</span>
    </>
  );
}

let fig_count = 1;
export function Caption({ children }: { children: JSX.Element[] | JSX.Element }) {
  const childrenList = Array.isArray(children) ? children : [children];
  const modifiedChildren = childrenList.map((c, i) =>
    i == 0 ? (
      <p>
        <b>
          <i>Abbildung {fig_count++}:</i> {c.props.children}
        </b>
      </p>
    ) : (
      c
    )
  );

  return <SideNote label={<>&#8853;</>}>{modifiedChildren}</SideNote>;
}
