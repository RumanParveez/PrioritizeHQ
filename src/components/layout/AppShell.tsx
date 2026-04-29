import type { ReactNode } from 'react';

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export default function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside
        data-sidebar
        style={{
          width: 240,
          flexShrink: 0,
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {sidebar}
      </aside>
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
        {children}
      </main>
    </div>
  );
}
