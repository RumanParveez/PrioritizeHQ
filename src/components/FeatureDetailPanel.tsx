import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { X, Pencil, Copy, Trash2, Lock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Feature, ScoringInputs } from '../types';

/* ───── lookup maps for derivation ───── */
const REACH: Record<ScoringInputs['customerScope'], number> = { all: 10000, enterprise: 5000, committed: 2000, internal: 500 };
const IMPACT_RICE: Record<ScoringInputs['valueDelivered'], number> = { transformative: 3, significant: 2, moderate: 1, minor: 0.5, negligible: 0.25 };
const CONFIDENCE_RICE: Record<ScoringInputs['confidenceLevel'], number> = { validated: 1.0, strong_hunch: 0.8, guess: 0.5, speculative: 0.3 };
const EFFORT: Record<ScoringInputs['buildComplexity'], number> = { S: 0.25, M: 0.5, L: 2, XL: 3, XXL: 6 };
const IMPACT_ICE: Record<ScoringInputs['valueDelivered'], number> = { transformative: 10, significant: 8, moderate: 6, minor: 4, negligible: 2 };
const SCOPE_MOD: Record<ScoringInputs['customerScope'], number> = { all: 1, enterprise: 0, committed: -1, internal: -2 };
const CONFIDENCE_ICE: Record<ScoringInputs['confidenceLevel'], number> = { validated: 10, strong_hunch: 8, guess: 5, speculative: 3 };
const EASE: Record<ScoringInputs['buildComplexity'], number> = { S: 10, M: 8, L: 5, XL: 3, XXL: 1 };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const SCOPE_LABEL: Record<string, string> = { all: 'All accounts', enterprise: 'Enterprise', committed: 'Committed', internal: 'Internal' };
const VALUE_LABEL: Record<string, string> = { transformative: 'Transformative', significant: 'Significant', moderate: 'Moderate', minor: 'Minor', negligible: 'Negligible' };
const CONF_LABEL: Record<string, string> = { validated: 'Validated 100%', strong_hunch: 'Strong hunch 80%', guess: 'Guess 50%', speculative: 'Speculative 30%' };

const consensusColor: Record<string, string> = { Strong: 'var(--consensus-strong)', Mixed: 'var(--consensus-mixed)', Conflict: 'var(--consensus-conflict)' };
const moscowColor: Record<string, string> = { Must: 'var(--moscow-must)', Should: 'var(--moscow-should)', Could: 'var(--moscow-could)', "Won't": 'var(--moscow-wont)' };

interface FeatureDetailPanelProps {
  featureId: string | null;
  onClose: () => void;
}

export default function FeatureDetailPanel({ featureId, onClose }: FeatureDetailPanelProps) {
  const { releaseId } = useParams<{ releaseId: string }>();
  const release = useAppStore((s) => s.releases.find((r) => r.id === releaseId));
  const deleteFeature = useAppStore((s) => s.deleteFeature);
  const duplicateFeature = useAppStore((s) => s.duplicateFeature);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const [derivationOpen, setDerivationOpen] = useState(false);

  const feature = release?.features.find((f) => f.id === featureId) ?? null;

  // Close on Escape
  useEffect(() => {
    if (!feature) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [feature, onClose]);

  if (!feature || !releaseId) return null;

  const inp = feature.inputs;
  const reach = REACH[inp.customerScope];
  const impR = IMPACT_RICE[inp.valueDelivered];
  const confR = CONFIDENCE_RICE[inp.confidenceLevel];
  const effort = EFFORT[inp.buildComplexity];
  const impI = clamp(IMPACT_ICE[inp.valueDelivered] + SCOPE_MOD[inp.customerScope], 1, 10);
  const confI = CONFIDENCE_ICE[inp.confidenceLevel];
  const ease = EASE[inp.buildComplexity];

  const total = release?.features.length ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }} />

      {/* Panel */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, zIndex: 50, background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-default)', boxShadow: '-4px 0 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{feature.name}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, color: consensusColor[feature.consensus], background: feature.consensus === 'Strong' ? 'var(--consensus-strong-surface)' : feature.consensus === 'Mixed' ? 'var(--consensus-mixed-surface)' : 'var(--consensus-conflict-surface)' }}>
                {feature.consensus}
              </span>
              <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, color: moscowColor[feature.scores.moscow], border: `1px solid ${moscowColor[feature.scores.moscow]}` }}>
                {feature.scores.moscow}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => { setActiveTab('add-edit'); onClose(); }} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Pencil size={16} /></button>
            <button onClick={onClose} title="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={16} /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Score cards */}
          <div style={{ display: 'flex', gap: 10 }}>
            <ScoreCard label="RICE" value={feature.scores.rice.toLocaleString()} sub={`#${feature.scores.riceRank ?? '?'} of ${total}`} />
            <ScoreCard label="ICE" value={String(feature.scores.ice)} sub={`#${feature.scores.iceRank ?? '?'} of ${total}`} />
            <ScoreCard label="MoSCoW" value={feature.scores.moscow} sub={inp.strategicNecessity.replace(/_/g, ' ')} color={moscowColor[feature.scores.moscow]} />
          </div>

          {/* Derivation accordion */}
          <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button onClick={() => setDerivationOpen((v) => !v)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Score derivation</span>
              <span>{derivationOpen ? '−' : '+'}</span>
            </button>
            {derivationOpen && (
              <div style={{ padding: '12px 14px', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>RICE</div>
                  <div className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {reach.toLocaleString()} × {impR} × {confR} ÷ {effort} = {feature.scores.rice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>ICE</div>
                  <div className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {impI} × {confI} × {ease} = {feature.scores.ice}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input summary */}
          <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Inputs</div>
            {[
              { label: 'Scope', value: SCOPE_LABEL[inp.customerScope] },
              { label: 'Value', value: VALUE_LABEL[inp.valueDelivered] },
              { label: 'Confidence', value: CONF_LABEL[inp.confidenceLevel] },
              { label: 'Complexity', value: inp.buildComplexity },
              { label: 'Necessity', value: inp.strategicNecessity.replace(/_/g, ' ') },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Mini histogram - score context */}
          <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Score context</div>
            <MiniHistogram features={release?.features ?? []} currentId={feature.id} />
          </div>

          {/* V2 placeholder */}
          <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px', background: 'var(--bg-tertiary)', opacity: 0.6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={16} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>AI Audit</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Available in Pro</div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveTab('add-edit'); onClose(); }} style={{ padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Edit scoring
          </button>
          <button onClick={() => { duplicateFeature(releaseId, feature.id); }} style={{ padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Copy size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Duplicate
          </button>
          <button onClick={() => { deleteFeature(releaseId, feature.id); onClose(); }} style={{ padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 500, border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--consensus-conflict-surface)', color: 'var(--consensus-conflict)', cursor: 'pointer' }}>
            <Trash2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Delete
          </button>
        </div>
      </div>
    </>
  );
}

/* ── sub components ── */

function ScoreCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div style={{ flex: 1, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div className="mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: color ?? 'var(--text-primary)', marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function MiniHistogram({ features, currentId }: { features: Feature[]; currentId: string }) {
  if (features.length === 0) return null;
  const sorted = [...features].sort((a, b) => b.scores.rice - a.scores.rice);
  const max = sorted[0]?.scores.rice || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
      {sorted.map((f) => (
        <div
          key={f.id}
          style={{
            flex: 1,
            minWidth: 4,
            maxWidth: 12,
            height: `${Math.max(8, (f.scores.rice / max) * 100)}%`,
            background: f.id === currentId ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            borderRadius: 2,
            transition: 'background 0.15s',
          }}
          title={`${f.name}: ${f.scores.rice}`}
        />
      ))}
    </div>
  );
}
