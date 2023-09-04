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

export function Caption({ children }: { children: React.ReactNode }) {
  return <SideNote label={<>&#8853;</>}>{children}</SideNote>;
}
