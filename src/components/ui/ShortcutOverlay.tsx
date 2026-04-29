import { useEffect } from 'react';

const shortcuts = [
  { key: 'N', desc: 'New release' },
  { key: '1–9', desc: 'Open release by position' },
  { key: '?', desc: 'Toggle this help' },
  { key: 'Esc', desc: 'Close modal / overlay' },
  { key: 'Cmd+Enter', desc: 'Add feature (in Add/Edit)' },
  { key: 'Tab', desc: 'Navigate tabs' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.25)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 380, background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Keyboard shortcuts</h2>
        {shortcuts.map((s) => (
          <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-default)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{s.desc}</span>
            <kbd className="mono" style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
              {s.key}
            </kbd>
          </div>
        ))}
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 16, marginBottom: 0 }}>
          Press <kbd className="mono" style={{ fontSize: '0.625rem', background: 'var(--bg-tertiary)', padding: '1px 4px', borderRadius: 'var(--radius-sm)' }}>?</kbd> or <kbd className="mono" style={{ fontSize: '0.625rem', background: 'var(--bg-tertiary)', padding: '1px 4px', borderRadius: 'var(--radius-sm)' }}>Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
