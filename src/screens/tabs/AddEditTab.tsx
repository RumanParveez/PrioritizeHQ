import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Zap, Target, MessageCircle, Sparkles, Home, Pencil, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { calculateRICE, calculateICE, calculateMoSCoW } from '../../lib/scoring';
import type { ScoringInputs, Feature } from '../../types';

/* ───── constants ───── */

const EMPTY_INPUTS: ScoringInputs = {
  customerScope: 'all',
  valueDelivered: 'moderate',
  confidenceLevel: 'guess',
  buildComplexity: 'M',
  strategicNecessity: 'user_requested',
};

const SCOPE_OPTIONS: { value: ScoringInputs['customerScope']; label: string }[] = [
  { value: 'all', label: 'All accounts' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'committed', label: 'Committed accounts' },
  { value: 'internal', label: 'Internal' },
];

const VALUE_OPTIONS: { value: ScoringInputs['valueDelivered']; label: string; sub: string; bars: number }[] = [
  { value: 'transformative', label: 'Transformative', sub: 'changes how they work', bars: 5 },
  { value: 'significant', label: 'Significant', sub: 'removes a major pain point', bars: 4 },
  { value: 'moderate', label: 'Moderate', sub: 'noticeable improvement', bars: 3 },
  { value: 'minor', label: 'Minor', sub: 'quality of life', bars: 2 },
  { value: 'negligible', label: 'Negligible', sub: 'barely noticeable', bars: 1 },
];

const CONFIDENCE_OPTIONS: { value: ScoringInputs['confidenceLevel']; label: string }[] = [
  { value: 'validated', label: 'Validated 100%' },
  { value: 'strong_hunch', label: 'Strong hunch 80%' },
  { value: 'guess', label: 'Guess 50%' },
  { value: 'speculative', label: 'Speculative 30%' },
];

const COMPLEXITY_OPTIONS: { value: ScoringInputs['buildComplexity']; label: string }[] = [
  { value: 'S', label: 'S \u2014 days' },
  { value: 'M', label: 'M \u2014 weeks' },
  { value: 'L', label: 'L \u2014 1-2mo' },
  { value: 'XL', label: 'XL \u2014 quarter' },
  { value: 'XXL', label: 'XXL \u2014 multi-Q' },
];

const NECESSITY_OPTIONS: { value: ScoringInputs['strategicNecessity']; label: string; sub: string; icon: typeof Lock }[] = [
  { value: 'commitment', label: 'Customer commitment', sub: 'promised contractually', icon: Lock },
  { value: 'competitive', label: 'Competitive table stakes', sub: 'losing deals', icon: Zap },
  { value: 'differentiator', label: 'Strategic differentiator', sub: 'our angle', icon: Target },
  { value: 'user_requested', label: 'User-requested', sub: 'nice to have', icon: MessageCircle },
  { value: 'speculative_bet', label: 'Speculative bet', sub: 'unvalidated', icon: Sparkles },
  { value: 'internal', label: 'Internal initiative', sub: 'not customer facing', icon: Home },
];

const consensusDot: Record<string, string> = {
  Strong: 'var(--consensus-strong)',
  Mixed: 'var(--consensus-mixed)',
  Conflict: 'var(--consensus-conflict)',
};

const moscowColor: Record<string, string> = {
  Must: 'var(--moscow-must)',
  Should: 'var(--moscow-should)',
  Could: 'var(--moscow-could)',
  "Won't": 'var(--moscow-wont)',
};

/* ───── animated number hook ───── */

function useAnimatedNumber(target: number, duration = 150) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = display;
    const diff = target - start;
    if (diff === 0) return;
    const t0 = performance.now();
    function tick(now: number) {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(start + diff * progress));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

/* ───── sub components ───── */

function IntensityBars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{ width: 16, height: 4, borderRadius: 2, background: i < count ? 'var(--accent-primary)' : 'var(--bg-tertiary)' }} />
      ))}
    </div>
  );
}

const pillBase: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '0.875rem',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-primary)',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  fontWeight: 500,
  transition: 'all 0.12s',
};
const pillActive: React.CSSProperties = {
  background: 'var(--accent-surface)',
  borderColor: 'var(--accent-primary)',
  color: 'var(--accent-primary)',
};

function RadioPills<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{ ...pillBase, ...(value === o.value ? pillActive : {}) }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function QuestionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{children}</div>;
}

/* ───── main component ───── */

export default function AddEditTab() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const release = useAppStore((s) => s.releases.find((r) => r.id === releaseId));
  const addFeature = useAppStore((s) => s.addFeature);
  const updateFeature = useAppStore((s) => s.updateFeature);
  const deleteFeature = useAppStore((s) => s.deleteFeature);

  const [name, setName] = useState('');
  const [inputs, setInputs] = useState<ScoringInputs>({ ...EMPTY_INPUTS });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rapidMode, setRapidMode] = useState(false);
  const [nameShake, setNameShake] = useState(false);
  const nameRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Focus name input on mount
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Live preview
  const previewRice = useMemo(() => calculateRICE(inputs), [inputs]);
  const previewIce = useMemo(() => calculateICE(inputs), [inputs]);
  const previewMoscow = useMemo(() => calculateMoSCoW(inputs), [inputs]);
  const animRice = useAnimatedNumber(previewRice);
  const animIce = useAnimatedNumber(previewIce);

  const features = useMemo(() => {
    if (!release) return [];
    return [...release.features].sort((a, b) => b.scores.rice - a.scores.rice);
  }, [release]);

  const setField = useCallback(<K extends keyof ScoringInputs>(key: K, val: ScoringInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  }, []);

  function clearForm() {
    setName('');
    setInputs({ ...EMPTY_INPUTS });
    setEditingId(null);
    nameRef.current?.focus();
  }

  function handleAdd(andContinue = false) {
    if (!releaseId) return;
    if (!name.trim()) {
      setNameShake(true);
      nameRef.current?.focus();
      setTimeout(() => setNameShake(false), 500);
      return;
    }
    if (rapidMode) {
      const names = name.split('\n').map((n) => n.trim()).filter(Boolean);
      names.forEach((n) => addFeature(releaseId, inputs, n));
    } else if (editingId) {
      updateFeature(releaseId, editingId, { name: name.trim(), inputs });
    } else {
      addFeature(releaseId, inputs, name.trim());
    }
    if (andContinue || rapidMode) {
      setName('');
      nameRef.current?.focus();
    } else {
      clearForm();
    }
    if (editingId) setEditingId(null);
  }

  function handleEdit(f: Feature) {
    setEditingId(f.id);
    setName(f.name);
    setInputs({ ...f.inputs });
    setRapidMode(false);
    nameRef.current?.focus();
  }

  // Cmd/Ctrl+Enter
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, inputs, editingId, rapidMode, releaseId]);

  if (!release || !releaseId) return null;

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* LEFT — Form */}
      <div style={{ flex: '1 1 480px', minWidth: 320 }}>
        {/* Rapid mode toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={rapidMode} onChange={(e) => { setRapidMode(e.target.checked); setEditingId(null); }} />
          Rapid mode — add multiple features at once
        </label>

        {/* Feature name */}
        {rapidMode ? (
          <textarea
            ref={nameRef as React.RefObject<HTMLTextAreaElement>}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="One feature name per line…"
            rows={4}
            style={{ width: '100%', fontSize: '1.125rem', padding: '12px 16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', background: 'var(--bg-primary)', resize: 'vertical', fontFamily: 'inherit' }}
          />
        ) : (
          <input
            ref={nameRef as React.RefObject<HTMLInputElement>}
            value={name}
            onChange={(e) => { setName(e.target.value); if (nameShake) setNameShake(false); }}
            placeholder="What feature are you scoring?"
            style={{ width: '100%', fontSize: '1.125rem', padding: '12px 16px', border: `1px solid ${nameShake ? 'var(--consensus-conflict)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', background: 'var(--bg-primary)', animation: nameShake ? 'shake 0.4s ease' : undefined }}
          />
        )}
        {rapidMode && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Apply same answers to all features below.</p>
        )}

        {/* Q1 */}
        <section style={{ marginTop: 24 }}>
          <QuestionLabel>Who does this impact?</QuestionLabel>
          <RadioPills options={SCOPE_OPTIONS} value={inputs.customerScope} onChange={(v) => setField('customerScope', v)} />
        </section>

        {/* Q2 */}
        <section style={{ marginTop: 24 }}>
          <QuestionLabel>How much does this improve their workflow?</QuestionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {VALUE_OPTIONS.map((o) => {
              const sel = inputs.valueDelivered === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setField('valueDelivered', o.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    border: `1px solid ${sel ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    background: sel ? 'var(--accent-surface)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                >
                  <IntensityBars count={o.bars} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: sel ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{o.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Q3 */}
        <section style={{ marginTop: 24 }}>
          <QuestionLabel>How sure are you this is right?</QuestionLabel>
          <RadioPills options={CONFIDENCE_OPTIONS} value={inputs.confidenceLevel} onChange={(v) => setField('confidenceLevel', v)} />
        </section>

        {/* Q4 */}
        <section style={{ marginTop: 24 }}>
          <QuestionLabel>How hard is this to ship?</QuestionLabel>
          <RadioPills options={COMPLEXITY_OPTIONS} value={inputs.buildComplexity} onChange={(v) => setField('buildComplexity', v)} />
        </section>

        {/* Q5 */}
        <section style={{ marginTop: 24 }}>
          <QuestionLabel>Why does this need to exist?</QuestionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {NECESSITY_OPTIONS.map((o) => {
              const sel = inputs.strategicNecessity === o.value;
              const Icon = o.icon;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setField('strategicNecessity', o.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    border: `1px solid ${sel ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    background: sel ? 'var(--accent-surface)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                >
                  <Icon size={16} style={{ color: sel ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: sel ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{o.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Live score preview */}
        <div
          style={{
            marginTop: 24,
            padding: '14px 18px',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
          }}
        >
          <ScorePill label="RICE" value={animRice} />
          <ScorePill label="ICE" value={animIce} />
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MoSCoW</span>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: moscowColor[previewMoscow] ?? 'var(--text-primary)' }}>{previewMoscow}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {rapidMode ? (
            <button type="button" onClick={() => handleAdd()} disabled={!name.trim()} style={btnPrimary(!!name.trim())}>
              Add all
            </button>
          ) : editingId ? (
            <button type="button" onClick={() => handleAdd()} disabled={!name.trim()} style={btnPrimary(!!name.trim())}>
              Save changes
            </button>
          ) : (
            <>
              <button type="button" onClick={() => handleAdd()} disabled={!name.trim()} style={btnPrimary(!!name.trim())}>
                Add feature
              </button>
              <button type="button" onClick={() => handleAdd(true)} disabled={!name.trim()} style={btnSecondary(!!name.trim())}>
                Add &amp; continue
              </button>
            </>
          )}
          <button type="button" onClick={clearForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {editingId ? 'Cancel' : 'Clear'}
          </button>
          {!rapidMode && !editingId && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-placeholder)', marginLeft: 'auto' }}>⌘ Enter to add</span>
          )}
        </div>
      </div>

      {/* RIGHT — Live feature queue */}
      <div style={{ flex: '1 1 360px', minWidth: 280 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Feature queue ({features.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {features.map((f) => (
            <FeatureQueueCard
              key={f.id}
              feature={f}
              isEditing={editingId === f.id}
              onEdit={() => handleEdit(f)}
              onDelete={() => deleteFeature(releaseId, f.id)}
            />
          ))}
          {features.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No features yet. Use the form to add one.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── helpers ───── */

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <div className="mono" style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{value.toLocaleString()}</div>
    </div>
  );
}

function FeatureQueueCard({ feature, isEditing, onEdit, onDelete }: { feature: Feature; isEditing: boolean; onEdit: () => void; onDelete: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  return (
    <div
      style={{
        padding: '12px 14px',
        border: `1px solid ${isEditing ? 'var(--accent-primary)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        background: isEditing ? 'var(--accent-surface)' : 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.2s, transform 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {feature.name}
        </span>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
          <button onClick={onEdit} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--consensus-conflict)', padding: 2 }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: '0.6875rem', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
          RICE {feature.scores.rice.toLocaleString()}
        </span>
        <span className="mono" style={{ fontSize: '0.6875rem', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
          ICE {feature.scores.ice}
        </span>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: moscowColor[feature.scores.moscow] ?? 'var(--text-primary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: `1px solid ${moscowColor[feature.scores.moscow] ?? 'var(--border-default)'}` }}>
          {feature.scores.moscow}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: consensusDot[feature.consensus] ?? 'var(--text-muted)' }} />
          {feature.consensus}
        </span>
      </div>
    </div>
  );
}

function btnPrimary(enabled: boolean): React.CSSProperties {
  return {
    padding: '8px 20px',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: 'none',
    borderRadius: 'var(--radius-md)',
    background: enabled ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
    color: enabled ? '#fff' : 'var(--text-muted)',
    cursor: enabled ? 'pointer' : 'default',
  };
}

function btnSecondary(enabled: boolean): React.CSSProperties {
  return {
    padding: '8px 20px',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-primary)',
    color: enabled ? 'var(--text-secondary)' : 'var(--text-muted)',
    cursor: enabled ? 'pointer' : 'default',
  };
}
