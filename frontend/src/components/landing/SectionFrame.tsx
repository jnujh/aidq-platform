import type { ReactNode } from 'react';

export default function SectionFrame({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      style={{
        minHeight: 'calc(100vh - 72px)',
        scrollMarginTop: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}
