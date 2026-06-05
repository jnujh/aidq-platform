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
        scrollMarginTop: 80,
      }}
    >
      {children}
    </div>
  );
}
