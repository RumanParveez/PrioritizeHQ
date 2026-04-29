import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { showToast } from '../../store/useToastStore';

interface WorkspaceSidebarProps {
  releaseId: string;
}

const statusColors: Record<string, string> = {
  Draft: 'var(--text-muted)',
  'In Review': 'var(--consensus-mixed)',
  Finalized: 'var(--consensus-strong)',
};

const consensusDotColors: Record<string, string> = {
  Strong: 'var(--consensus-strong)',
  Mixed: 'var(--consensus-mixed)',
  Conflict: 'var(--consensus-conflict)',
};

export default function WorkspaceSidebar({ releaseId }: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const release = useAppStore((s) => s.releases.find((r) => r.id === releaseId));
  const updateRelease = useAppStore((s) => s.updateRelease);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const finalizeRelease = useAppStore((s) => s.finalizeRelease);
  const deleteFeature = useAppStore((s) => s.deleteFeature);
  const reorderFeatures = useAppStore((s) => s.reorderFeatures);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(release?.name ?? '');
  const [editingDate, setEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(release?.targetDate ?? '');
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [capacityValue, setCapacityValue] = useState(String(release?.capacity ?? ''));
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);

  // Drag-and-drop state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const isFinalized = release?.status === 'Finalized';

  // Focus trap ref for finalize modal
  const finalizeModalRef = useRef<HTMLDivElement>(null);

  // Close finalize modal on Escape
  useEffect(() => {
    if (!confirmFinalize) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); setConfirmFinalize(false); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [confirmFinalize]);

  // Focus trap for finalize modal
  useEffect(() => {
    if (confirmFinalize) finalizeModalRef.current?.focus();
  }, [confirmFinalize]);

  if (!release) return null;

  function commitName() {
    if (nameValue.trim()) updateRelease(releaseId, { name: nameValue.trim() });
    setEditingName(false);
  }

  function commitDate() {
    updateRelease(releaseId, { targetDate: dateValue || undefined });
    setEditingDate(false);
  }

  function commitCapacity() {
    const num = Number(capacityValue);
    updateRelease(releaseId, { capacity: num > 0 ? num : undefined });
    setEditingCapacity(false);
  }

  function handleFeatureClick(featureId: string) {
    setSelectedFeatureId(featureId);
    setActiveTab('add-edit');
  }

  const handleShare = useCallback(() => {
    if (!release) return;
    try {
      const json = JSON.stringify(release);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}/release/${releaseId}#data=${encoded}`;
      navigator.clipboard.writeText(url)
        .then(() => showToast('Link copied to clipboard', 'success'))
        .catch(() => showToast('Clipboard denied. Select and copy manually.', 'error'));
    } catch {
      showToast('Failed to generate share link.', 'error');
    }
  }, [release, releaseId]);

  function handleConfirmFinalize() {
    finalizeRelease(releaseId);
    setConfirmFinalize(false);
    showToast('Release finalized', 'success');
  }

  // Drag handlers
  function handleDragStart(e: React.DragEvent, idx: number) {
    if (isFinalized) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    setDragIdx(idx);
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIdx(idx);
  }
  function handleDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault();
    const fromIdx = dragIdx;
    setDragIdx(null);
    setDropIdx(null);
    if (fromIdx != null && fromIdx !== toIdx) {
      reorderFeatures(releaseId, fromIdx, toIdx);
    }
  }
  function handleDragEnd() {
    setDragIdx(null);
    setDropIdx(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: '0.8125rem' }}>
      {/* Header */}
      <div style={{ padding: '0.75rem 0.75rem 0.5rem', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)', padding: 0 }}
            aria-label="Back to home"
          >
            ←
          </button>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>PrioritizeHQ</span>
        </div>

        {/* Release name */}
        {editingName && !isFinalized ? (
          <input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === 'Enter' && commitName()}
            autoFocus
            style={{
              width: '100%',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.375rem',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
        ) : (
          <div
            onClick={() => { if (!isFinalized) { setNameValue(release.name); setEditingName(true); } }}
            style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: isFinalized ? 'default' : 'pointer', fontSize: '0.875rem' }}
          >
            {release.name}
          </div>
        )}

        {/* Status badge */}
        <span
          style={{
            display: 'inline-block',
            marginTop: '0.375rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: statusColors[release.status],
            border: `1px solid ${statusColors[release.status]}`,
          }}
        >
          {release.status === 'Finalized' && '✓ '}{release.status}
        </span>
      </div>

      {/* Meta section */}
      <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {/* Target date */}
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Date</span>
          {editingDate && !isFinalized ? (
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              onBlur={commitDate}
              autoFocus
              style={{ display: 'block', width: '100%', marginTop: '0.125rem', fontSize: '0.8125rem', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '0.125rem 0.25rem' }}
            />
          ) : (
            <div
              onClick={() => { if (!isFinalized) { setDateValue(release.targetDate ?? ''); setEditingDate(true); } }}
              style={{ color: release.targetDate ? 'var(--text-primary)' : 'var(--text-placeholder)', cursor: isFinalized ? 'default' : 'pointer', marginTop: '0.125rem' }}
            >
              {release.targetDate || 'Set date'}
            </div>
          )}
        </div>

        {/* Capacity */}
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Capacity</span>
          {editingCapacity && !isFinalized ? (
            <input
              type="number"
              value={capacityValue}
              onChange={(e) => setCapacityValue(e.target.value)}
              onBlur={commitCapacity}
              onKeyDown={(e) => e.key === 'Enter' && commitCapacity()}
              autoFocus
              style={{ display: 'block', width: '100%', marginTop: '0.125rem', fontSize: '0.8125rem', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '0.125rem 0.25rem' }}
            />
          ) : (
            <div
              onClick={() => { if (!isFinalized) { setCapacityValue(String(release.capacity ?? '')); setEditingCapacity(true); } }}
              style={{ color: release.capacity ? 'var(--text-primary)' : 'var(--accent-primary)', cursor: isFinalized ? 'default' : 'pointer', marginTop: '0.125rem' }}
            >
              {release.capacity ? `${release.capacity} points` : 'Set capacity'}
            </div>
          )}
        </div>

        {/* Description */}
        {release.description && (
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
            <div
              onClick={() => setDescExpanded(!descExpanded)}
              style={{
                color: 'var(--text-secondary)',
                marginTop: '0.125rem',
                cursor: 'pointer',
                ...(descExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }),
              }}
            >
              {release.description}
            </div>
          </div>
        )}
      </div>

      {/* Feature list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem 0' }}>
        <div style={{ padding: '0 0.75rem 0.375rem', color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Features ({release.features.length})
        </div>
        {release.features.map((f, idx) => (
          <div
            key={f.id}
            draggable={!isFinalized}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            onClick={() => handleFeatureClick(f.id)}
            onMouseEnter={() => setHoveredFeatureId(f.id)}
            onMouseLeave={() => setHoveredFeatureId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              cursor: isFinalized ? 'pointer' : 'grab',
              borderLeft: selectedFeatureId === f.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
              borderTop: dropIdx === idx && dragIdx !== null && dragIdx !== idx ? '2px solid var(--accent-primary)' : '2px solid transparent',
              background: selectedFeatureId === f.id ? 'var(--accent-surface)' : 'transparent',
              opacity: dragIdx === idx ? 0.5 : 1,
              position: 'relative',
              transition: 'border-top 0.1s',
            }}
          >
            {/* Consensus dot */}
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                background: consensusDotColors[f.consensus] ?? 'var(--text-muted)',
              }}
            />
            {/* Feature name */}
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'var(--text-primary)',
              }}
            >
              {f.name}
            </span>
            {/* Rank pill */}
            {f.scores.riceRank != null && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  padding: '0.0625rem 0.375rem',
                  borderRadius: '9999px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  flexShrink: 0,
                }}
              >
                #{f.scores.riceRank}
              </span>
            )}
            {/* Delete icon on hover */}
            {hoveredFeatureId === f.id && !isFinalized && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteFeature(releaseId, f.id); }}
                style={{
                  position: 'absolute',
                  right: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--consensus-conflict)',
                  fontSize: '0.75rem',
                  padding: 0,
                }}
                aria-label="Delete feature"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add feature button */}
      {!isFinalized && (
      <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border-default)' }}>
        <button
          onClick={() => setActiveTab('add-edit')}
          style={{
            width: '100%',
            padding: '0.375rem',
            background: 'none',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.8125rem',
          }}
        >
          + Add feature
        </button>
      </div>
      )}

      {/* Footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '0.375rem', flexWrap: 'wrap', position: 'relative' }}>
        {/* Export dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            Export ▾
          </button>
          {exportOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: 4,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                zIndex: 10,
                minWidth: 100,
              }}
            >
              {['Markdown', 'CSV', 'JSON', 'Print'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => setExportOpen(false)}
                  style={{ padding: '0.375rem 0.625rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleShare}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          Share
        </button>

        <button
          onClick={() => setConfirmFinalize(true)}
          disabled={isFinalized}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: isFinalized ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
            color: isFinalized ? 'var(--text-muted)' : '#fff',
            cursor: isFinalized ? 'default' : 'pointer',
            marginLeft: 'auto',
          }}
        >
          {isFinalized ? '✓ Finalized' : 'Finalize'}
        </button>
      </div>

      {/* Finalize confirmation modal */}
      {confirmFinalize && (
        <div
          onClick={() => setConfirmFinalize(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.25)' }}
        >
          <div
            ref={finalizeModalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm finalize release"
            style={{ width: 400, background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', outline: 'none' }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Finalize this release?</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              This will lock scores and mark the release as complete. Editing will be disabled for all features.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setConfirmFinalize(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFinalize}
                autoFocus
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent-primary)', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
              >
                Finalize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
