import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { showToast } from '../store/useToastStore';
import AppShell from '../components/layout/AppShell';
import WorkspaceSidebar from '../components/layout/WorkspaceSidebar';
import TabBar from '../components/layout/TabBar';
import AddEditTab from '../screens/tabs/AddEditTab';
import RankingsTab from '../screens/tabs/RankingsTab';
import DashboardTab from '../screens/tabs/DashboardTab';
import ReportsTab from '../screens/tabs/ReportsTab';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import ShortcutOverlay from '../components/ui/ShortcutOverlay';

export default function WorkspaceScreen() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const release = useAppStore((s) => s.releases.find((r) => r.id === releaseId));
  const activeTab = useAppStore((s) => s.activeTab);
  const importRelease = useAppStore((s) => s.importRelease);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [importOffer, setImportOffer] = useState<string | null>(null);

  // Dynamic document title
  useEffect(() => {
    document.title = release ? `${release.name} — PrioritizeHQ` : 'PrioritizeHQ';
  }, [release?.name, release]);

  // Check for shared data in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
      const encoded = hash.slice(6);
      setImportOffer(encoded);
    }
  }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === '?') { e.preventDefault(); setShortcutsOpen((v) => !v); }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!release) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
        Release not found.
      </div>
    );
  }

  return (
    <AppShell sidebar={<WorkspaceSidebar releaseId={release.id} />}>
      <TabBar />
      <div style={{ padding: '2rem' }}>
        {activeTab === 'dashboard' && <ErrorBoundary label="Dashboard"><DashboardTab /></ErrorBoundary>}
        {activeTab === 'rankings' && <ErrorBoundary label="Rankings"><RankingsTab /></ErrorBoundary>}
        {activeTab === 'add-edit' && <ErrorBoundary label="Add/Edit"><AddEditTab /></ErrorBoundary>}
        {activeTab === 'reports' && <ErrorBoundary label="Reports"><ReportsTab /></ErrorBoundary>}
      </div>
      <ShortcutOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      {/* Import offer modal from shared link */}
      {importOffer && (
        <div
          onClick={() => { setImportOffer(null); window.location.hash = ''; }}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.25)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Import shared release"
            style={{ width: 420, background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Shared release detected</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              This link contains embedded release data. Would you like to import it as a new release?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => { setImportOffer(null); window.location.hash = ''; }}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  try {
                    const json = decodeURIComponent(escape(atob(importOffer)));
                    const data = JSON.parse(json);
                    importRelease(data);
                    showToast('Release imported successfully', 'success');
                  } catch {
                    showToast('Import failed: file is not valid PrioritizeHQ data.', 'error');
                  }
                  setImportOffer(null);
                  window.location.hash = '';
                }}
                autoFocus
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent-primary)', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
              >
                Import release
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
