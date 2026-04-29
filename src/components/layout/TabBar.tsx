import { useAppStore } from '../../store/useAppStore';
import type { AppStore } from '../../types';

const tabs: { key: AppStore['activeTab']; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'rankings', label: 'Rankings' },
  { key: 'add-edit', label: 'Add / Edit' },
  { key: 'reports', label: 'Reports' },
];

export default function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  function handleKeyDown(e: React.KeyboardEvent, tab: AppStore['activeTab']) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  }

  return (
    <nav
      data-tabbar
      role="tablist"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        display: 'flex',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => setActiveTab(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, tab.key)}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
