import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Settings, HelpCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Release, ConsensusSignal } from '../types';
import ShortcutOverlay from '../components/ui/ShortcutOverlay';

/* ───── Logo SVG ───── */
function LogoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <line x1="4" y1="2" x2="10" y2="18" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="4" x2="10" y2="18" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="2" x2="10" y2="18" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ───── Consensus bar ───── */
function ConsensusBar({ features }: { features: Release['features'] }) {
  const total = features.length;
  if (total === 0) return null;
  const counts: Record<ConsensusSignal, number> = { Strong: 0, Mixed: 0, Conflict: 0 };
  features.forEach((f) => counts[f.consensus]++);
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--bg-tertiary)', marginTop: 12 }}>
      {counts.Strong > 0 && <div style={{ width: pct(counts.Strong), background: 'var(--consensus-strong)' }} />}
      {counts.Mixed > 0 && <div style={{ width: pct(counts.Mixed), background: 'var(--consensus-mixed)' }} />}
      {counts.Conflict > 0 && <div style={{ width: pct(counts.Conflict), background: 'var(--consensus-conflict)' }} />}
    </div>
  );
}

/* ───── Status badge ───── */
const statusStyles: Record<Release['status'], { color: string; border: string }> = {
  Draft: { color: 'var(--text-muted)', border: 'var(--text-muted)' },
  'In Review': { color: 'var(--consensus-mixed)', border: 'var(--consensus-mixed)' },
  Finalized: { color: 'var(--consensus-strong)', border: 'var(--consensus-strong)' },
};

/* ───── Empty‑state SVG ───── */
function EmptyIllustration() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden>
      <rect x="10" y="50" width="20" height="30" rx="4" fill="var(--bg-tertiary)" />
      <rect x="35" y="35" width="20" height="45" rx="4" fill="var(--border-default)" />
      <rect x="60" y="20" width="20" height="60" rx="4" fill="var(--border-strong)" />
      <rect x="85" y="10" width="20" height="70" rx="4" fill="var(--accent-primary)" opacity="0.3" />
    </svg>
  );
}

/* ───── New Release modal ───── */
function NewReleaseModal({ onClose }: { onClose: () => void }) {
  const createRelease = useAppStore((s) => s.createRelease);
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  // Focus trap
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>('input, textarea, button, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && focusables.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleCreate() {
    if (!name.trim()) return;
    createRelease({
      name: name.trim(),
      targetDate: targetDate || undefined,
      capacity: capacity ? Number(capacity) : undefined,
      description: description.trim() || undefined,
    });
    const id = useAppStore.getState().activeReleaseId;
    if (id) navigate(`/release/${id}`);
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.25)' }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create new release"
        style={{ width: 480, background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>New release</h2>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Release name *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Q3 2026 Launch"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Target date</span>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Capacity</span>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 40"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 24 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional notes about this release…"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', resize: 'vertical' }}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: name.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: name.trim() ? '#fff' : 'var(--text-muted)', cursor: name.trim() ? 'pointer' : 'default', fontSize: '0.875rem', fontWeight: 500 }}
          >
            Create release
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── Main HomeScreen ───── */
export default function HomeScreen() {
  const releases = useAppStore((s) => s.releases);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Global stats
  const totalFeatures = useMemo(() => releases.reduce((a, r) => a + r.features.length, 0), [releases]);
  const mostCommonConsensus = useMemo(() => {
    const counts: Record<string, number> = { Strong: 0, Mixed: 0, Conflict: 0 };
    releases.forEach((r) => r.features.forEach((f) => counts[f.consensus]++));
    const max = Math.max(...Object.values(counts));
    if (max === 0) return '—';
    return Object.entries(counts).find(([, v]) => v === max)?.[0] ?? '—';
  }, [releases]);
  const lastActive = useMemo(() => {
    if (releases.length === 0) return '—';
    const sorted = [...releases].sort((a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime());
    return sorted[0].name;
  }, [releases]);

  // Keyboard shortcuts
  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setModalOpen(true); }
    if (e.key === '?') { e.preventDefault(); setShortcutsOpen((v) => !v); }
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9 && num <= releases.length) {
      e.preventDefault();
      navigate(`/release/${releases[num - 1].id}`);
    }
  }, [releases, navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleGlobalKey]);

  // Dynamic document title
  useEffect(() => {
    document.title = 'PrioritizeHQ';
  }, []);

  const hasReleases = releases.length > 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasReleases ? 24 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark />
          <span style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            <span style={{ fontWeight: 400 }}>Prioritize</span>
            <span className="mono" style={{ fontWeight: 700 }}>HQ</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} aria-label="Settings">
            <Settings size={18} />
          </button>
          <button
            onClick={() => setShortcutsOpen((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* Tagline — only when empty */}
      {!hasReleases && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: 48 }}>
          Score features. See consensus. Ship what matters.
        </p>
      )}

      {/* Global stats bar */}
      {hasReleases && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          {[
            { label: 'Features Scored', value: totalFeatures },
            { label: 'Releases Created', value: releases.length },
            { label: 'Top Consensus', value: mostCommonConsensus },
            { label: 'Last Active', value: lastActive },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="mono" style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Release grid (or empty state) */}
      {hasReleases ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 24 }}>
          {releases.map((r) => (
            <ReleaseCard key={r.id} release={r} onClick={() => navigate(`/release/${r.id}`)} />
          ))}
          {/* New release card */}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: 'var(--bg-primary)',
              border: '2px dashed var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              minHeight: 160,
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>+</span>
            New release
          </button>
        </div>
      ) : (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <EmptyIllustration />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 24 }}>No releases yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, maxWidth: 360, marginInline: 'auto' }}>
            Create your first release to start scoring features and finding consensus with your team.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              marginTop: 24,
              padding: '10px 24px',
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            + New release
          </button>

          {/* 3-step explainer */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { step: '1', title: 'Add features', desc: "List the features you're considering for your next release." },
              { step: '2', title: 'Score them', desc: 'Use RICE, ICE, and MoSCoW frameworks to evaluate each feature.' },
              { step: '3', title: 'Ship consensus', desc: 'See where frameworks agree and make confident decisions.' },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 16px',
                  width: 200,
                  textAlign: 'left',
                }}
              >
                <div className="mono" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent-primary)', marginBottom: 8 }}>
                  Step {item.step}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && <NewReleaseModal onClose={() => setModalOpen(false)} />}

      {/* Shortcuts overlay */}
      <ShortcutOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

/* ───── Release card ───── */
function ReleaseCard({ release, onClick }: { release: Release; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const st = statusStyles[release.status];

  const relDate = (() => {
    try {
      if (release.targetDate) return formatDistanceToNow(new Date(release.targetDate), { addSuffix: true });
    } catch { /* ignore */ }
    return null;
  })();

  const editedAgo = (() => {
    try {
      return formatDistanceToNow(new Date(release.dateModified), { addSuffix: true });
    } catch {
      return '';
    }
  })();

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: 'left',
        background: 'var(--bg-primary)',
        border: `0.5px solid ${hovered ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Name & hover arrow */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{release.name}</span>
        {hovered && <span style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 500 }}>Open →</span>}
      </div>

      {/* Target date (relative) */}
      {relDate && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{relDate}</span>
      )}

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: '9999px',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
        }}>
          {release.features.length} feature{release.features.length !== 1 ? 's' : ''}
        </span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: '9999px',
          border: `1px solid ${st.border}`,
          color: st.color,
        }}>
          {release.status}
        </span>
      </div>

      {/* Consensus bar */}
      <ConsensusBar features={release.features} />

      {/* Last edited */}
      {editedAgo && (
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Last edited {editedAgo}
        </span>
      )}
    </button>
  );
}
