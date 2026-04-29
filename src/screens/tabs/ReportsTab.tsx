import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { showToast } from '../../store/useToastStore';
import type { Feature, ScoringInputs, ConsensusSignal } from '../../types';

/* ───── lookup maps ───── */

const SCOPE_LABEL: Record<ScoringInputs['customerScope'], string> = { all: 'All accounts', enterprise: 'Enterprise', committed: 'Committed', internal: 'Internal' };
const VALUE_LABEL: Record<ScoringInputs['valueDelivered'], string> = { transformative: 'Transformative', significant: 'Significant', moderate: 'Moderate', minor: 'Minor', negligible: 'Negligible' };
const CONF_LABEL: Record<ScoringInputs['confidenceLevel'], string> = { validated: 'Validated 100%', strong_hunch: 'Strong hunch 80%', guess: 'Guess 50%', speculative: 'Speculative 30%' };
const CONF_PCT: Record<ScoringInputs['confidenceLevel'], string> = { validated: '100', strong_hunch: '80', guess: '50', speculative: '30' };
const NECESSITY_LABEL: Record<ScoringInputs['strategicNecessity'], string> = { commitment: 'Customer commitment', competitive: 'Competitive table stakes', differentiator: 'Strategic differentiator', user_requested: 'User-requested', speculative_bet: 'Speculative bet', internal: 'Internal initiative' };
const EASE_LABEL: Record<ScoringInputs['buildComplexity'], string> = { S: 'high', M: 'moderate', L: 'low', XL: 'very low', XXL: 'minimal' };

const consensusColor: Record<ConsensusSignal, string> = { Strong: '#16A34A', Mixed: '#D97706', Conflict: '#DC2626' };
const moscowColor: Record<string, string> = { Must: '#16A34A', Should: '#2563EB', Could: '#D97706', "Won't": '#9C9B96' };

/* ───── styles ───── */

const sectionTitle: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, marginTop: 32, borderBottom: '1px solid var(--border-default)', paddingBottom: 8 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' };
const tdStyle: React.CSSProperties = { padding: '8px 10px', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-default)' };

/* ───── main component ───── */

export default function ReportsTab() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const release = useAppStore((s) => s.releases.find((r) => r.id === releaseId));

  const features = release?.features ?? [];
  const total = features.length;
  const capacity = release?.capacity ?? null;
  const sorted = useMemo(() => [...features].sort((a, b) => b.scores.rice - a.scores.rice), [features]);

  const moscowCounts = useMemo(() => {
    const c: Record<string, number> = { Must: 0, Should: 0, Could: 0, "Won't": 0 };
    features.forEach((f) => c[f.scores.moscow]++);
    return c;
  }, [features]);
  const moscowCategoryCount = useMemo(() => Object.values(moscowCounts).filter((v) => v > 0).length, [moscowCounts]);

  const consensusCounts = useMemo(() => {
    const c: Record<ConsensusSignal, number> = { Strong: 0, Mixed: 0, Conflict: 0 };
    features.forEach((f) => c[f.consensus]++);
    return c;
  }, [features]);

  const capacityCount = capacity != null && capacity > 0 ? Math.min(total, capacity) : total;
  const strongPct = total > 0 ? Math.round((consensusCounts.Strong / total) * 100) : 0;
  const topFeature = sorted[0] ?? null;

  const conflicts = useMemo(() => features.filter((f) => f.consensus === 'Conflict'), [features]);
  const mustsBelowCapacity = useMemo(() => {
    if (capacity == null || capacity <= 0) return [];
    return sorted.slice(capacity).filter((f) => f.scores.moscow === 'Must');
  }, [sorted, capacity]);

  /* ─── export helpers ─── */

  const generateMarkdown = useCallback(() => {
    if (!release) return '';
    const lines: string[] = [];
    lines.push(`# Release Prioritization Report`);
    lines.push(`## ${release.name}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push(`Features scored: ${total} | Capacity: ${capacity ?? '—'}`);
    lines.push('');
    lines.push('## Executive Summary');
    lines.push(buildSummaryText());
    lines.push('');
    lines.push('## Recommended Scope');
    sorted.forEach((f, i) => {
      const marker = capacity != null && capacity > 0 && i === capacity ? '\n--- CAPACITY CUTOFF ---\n' : '';
      lines.push(`${marker}${i + 1}. **${f.name}** — RICE: ${f.scores.rice}, ICE: ${f.scores.ice}, MoSCoW: ${f.scores.moscow}, Consensus: ${f.consensus}`);
    });
    lines.push('');
    lines.push('## Conflict Analysis');
    conflicts.forEach((f) => {
      lines.push(`### ${f.name}`);
      lines.push(buildConflictExplanation(f));
      lines.push('');
    });
    lines.push('');
    lines.push('## Appendix');
    lines.push('| Feature | Scope | Value | Confidence | Complexity | Necessity | RICE | ICE | MoSCoW | Consensus |');
    lines.push('|---------|-------|-------|------------|------------|-----------|------|-----|--------|-----------|');
    features.forEach((f) => {
      lines.push(`| ${f.name} | ${SCOPE_LABEL[f.inputs.customerScope]} | ${VALUE_LABEL[f.inputs.valueDelivered]} | ${CONF_LABEL[f.inputs.confidenceLevel]} | ${f.inputs.buildComplexity} | ${NECESSITY_LABEL[f.inputs.strategicNecessity]} | ${f.scores.rice} | ${f.scores.ice} | ${f.scores.moscow} | ${f.consensus} |`);
    });
    return lines.join('\n');
  }, [release, features, sorted, conflicts, total, capacity]);

  const exportMarkdown = useCallback(() => {
    const md = generateMarkdown();
    const name = release?.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() ?? 'report';
    download(`prioritize-hq-${name}.md`, md, 'text/markdown');
  }, [generateMarkdown, release]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Scope', 'Value', 'Confidence', 'Complexity', 'Necessity', 'RICE', 'ICE', 'MoSCoW', 'RICE Rank', 'ICE Rank', 'Consensus'];
    const rows = features.map((f) => [
      `"${f.name}"`, SCOPE_LABEL[f.inputs.customerScope], VALUE_LABEL[f.inputs.valueDelivered], CONF_LABEL[f.inputs.confidenceLevel], f.inputs.buildComplexity, NECESSITY_LABEL[f.inputs.strategicNecessity],
      f.scores.rice, f.scores.ice, f.scores.moscow, f.scores.riceRank ?? '', f.scores.iceRank ?? '', f.consensus,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const name = release?.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() ?? 'report';
    download(`prioritize-hq-${name}.csv`, csv, 'text/csv');
  }, [features, release]);

  const exportJSON = useCallback(() => {
    if (!release) return;
    const json = JSON.stringify(release, null, 2);
    const name = release.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    download(`prioritize-hq-${name}.json`, json, 'application/json');
  }, [release]);

  const exportPDF = useCallback(() => { window.print(); }, []);

  /* ─── summary text builder ─── */

  function buildSummaryText() {
    const topName = topFeature?.name ?? '—';
    const topRice = topFeature?.scores.rice.toLocaleString() ?? '—';
    const topScope = topFeature ? SCOPE_LABEL[topFeature.inputs.customerScope] : '—';
    const topConf = topFeature ? CONF_LABEL[topFeature.inputs.confidenceLevel] : '—';
    return `This release contains ${total || '—'} scored features across ${moscowCategoryCount} MoSCoW categories. ${capacityCount} features fit within the stated capacity of ${capacity ?? '—'} slots. Consensus is strong on ${consensusCounts.Strong} features (${strongPct}%) with ${consensusCounts.Conflict} features showing framework disagreement that may warrant discussion. The top-ranked feature by RICE is ${topName} (score: ${topRice}), driven by ${topScope} customer scope and ${topConf} confidence.`;
  }

  function buildConflictExplanation(f: Feature): string {
    const scope = SCOPE_LABEL[f.inputs.customerScope];
    const conf = CONF_PCT[f.inputs.confidenceLevel];
    const ease = EASE_LABEL[f.inputs.buildComplexity];
    const moscow = f.scores.moscow;
    const necessity = NECESSITY_LABEL[f.inputs.strategicNecessity];
    const lines: string[] = [];
    lines.push(`RICE scores high due to ${scope} reach. ICE scores lower because confidence is only ${conf}% and ease is ${ease}.`);
    lines.push(`MoSCoW flags '${moscow}' because the strategic necessity is '${necessity}'.`);
    lines.push(`Discussion prompt: Does the team have data to increase confidence? If validated, this moves up. If speculative, ICE and MoSCoW are probably right.`);
    return lines.join(' ');
  }

  if (!release || !releaseId) return null;

  /* ─── chart data ─── */
  const barData = sorted.map((f) => ({ name: f.name.length > 20 ? f.name.slice(0, 18) + '…' : f.name, rice: f.scores.rice, consensus: f.consensus }));
  const donutData = [
    { name: 'Strong', value: consensusCounts.Strong, fill: consensusColor.Strong },
    { name: 'Mixed', value: consensusCounts.Mixed, fill: consensusColor.Mixed },
    { name: 'Conflict', value: consensusCounts.Conflict, fill: consensusColor.Conflict },
  ];
  const moscowBarData = [{ Must: moscowCounts.Must, Should: moscowCounts.Should, Could: moscowCounts.Could, "Won't": moscowCounts["Won't"] }];

  return (
    <div className="report-content">
      {/* ─── Actions bar (non-print) ─── */}
      <div className="report-actions" style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--bg-primary)', padding: '10px 0', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <ActBtn label="Export PDF" onClick={exportPDF} />
        <ActBtn label="Export Markdown" onClick={exportMarkdown} />
        <ActBtn label="Export CSV" onClick={exportCSV} />
        <ActBtn label="Export JSON" onClick={exportJSON} />
        <ActBtn label="Copy report link" onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied!', 'success')).catch(() => showToast('Clipboard denied. Select and copy manually.', 'error')); }} />
      </div>

      {/* ─── Report header ─── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <line x1="4" y1="2" x2="10" y2="18" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="4" x2="10" y2="18" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="2" x2="10" y2="18" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            <span style={{ fontWeight: 400 }}>Prioritize</span><span className="mono" style={{ fontWeight: 700 }}>HQ</span>
          </span>
        </div>
        <h1 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 4 }}>Release Prioritization Report</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{release.name}</h2>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>{new Date().toLocaleDateString()}</span>
          <span>{total} features scored</span>
          <span>Capacity: {capacity ?? '—'}</span>
        </div>
      </div>

      {/* ─── Section 1: Executive summary ─── */}
      <h3 style={sectionTitle}>1. Executive Summary</h3>
      <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{buildSummaryText()}</p>

      {/* ─── Section 2: Recommended scope ─── */}
      <h3 style={sectionTitle}>2. Recommended Scope</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Feature</th>
            <th style={thStyle}>RICE</th>
            <th style={thStyle}>ICE</th>
            <th style={thStyle}>MoSCoW</th>
            <th style={thStyle}>Consensus</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((f, i) => {
            const belowCap = capacity != null && capacity > 0 && i >= capacity;
            const isCutoff = capacity != null && capacity > 0 && i === capacity;
            return (
              <RowGroup key={f.id} feature={f} idx={i} belowCap={belowCap} isCutoff={isCutoff} capacity={capacity} />
            );
          })}
        </tbody>
      </table>
      {mustsBelowCapacity.length > 0 && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--consensus-conflict-surface)', border: '1px solid var(--consensus-conflict)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--consensus-conflict)' }}>
          ⚠ Warning: {mustsBelowCapacity.length} Must-have feature{mustsBelowCapacity.length > 1 ? 's' : ''} fall{mustsBelowCapacity.length === 1 ? 's' : ''} below the capacity cutoff: {mustsBelowCapacity.map((f) => f.name).join(', ')}
        </div>
      )}

      {/* ─── Section 3: Framework comparison ─── */}
      <h3 style={sectionTitle}>3. Framework Comparison</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Feature</th>
            <th style={thStyle}>RICE</th>
            <th style={thStyle}>RICE #</th>
            <th style={thStyle}>ICE</th>
            <th style={thStyle}>ICE #</th>
            <th style={thStyle}>MoSCoW</th>
            <th style={thStyle}>Consensus</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((f, i) => (
            <tr key={f.id} style={{ background: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)' }}>
              <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--text-primary)' }}>{f.name}</td>
              <td style={tdStyle} className="mono">{f.scores.rice.toLocaleString()}</td>
              <td style={tdStyle}>#{f.scores.riceRank ?? '?'}</td>
              <td style={tdStyle} className="mono">{f.scores.ice}</td>
              <td style={tdStyle}>#{f.scores.iceRank ?? '?'}</td>
              <td style={{ ...tdStyle, color: moscowColor[f.scores.moscow], fontWeight: 600 }}>{f.scores.moscow}</td>
              <td style={{ ...tdStyle, color: consensusColor[f.consensus], fontWeight: 600 }}>{f.consensus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ─── Section 4: Conflict analysis ─── */}
      <h3 style={sectionTitle}>4. Conflict Analysis</h3>
      {conflicts.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No conflicting features — all frameworks are in agreement or partially aligned.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {conflicts.map((f) => (
            <div key={f.id} style={{ border: '1px solid var(--consensus-conflict)', borderRadius: 'var(--radius-md)', padding: '14px 18px', background: 'var(--consensus-conflict-surface)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 6 }}>{f.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', gap: 12 }}>
                <span>RICE #{f.scores.riceRank ?? '?'}</span>
                <span>ICE #{f.scores.iceRank ?? '?'}</span>
                <span>MoSCoW: {f.scores.moscow}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {buildConflictExplanation(f)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Section 5: Visualizations (static, print-friendly) ─── */}
      <h3 style={sectionTitle}>5. Visualizations</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, pageBreakInside: 'avoid' }}>
        {/* Score distribution */}
        <div style={{ border: '0.5px solid var(--border-default)', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Score Distribution (RICE)</div>
          <ResponsiveContainer width="100%" height={Math.max(120, barData.length * 24)}>
            <BarChart layout="vertical" data={barData} margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#E4E3DF" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9C9B96' }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#5C5B57' }} />
              <Bar dataKey="rice" radius={[0, 3, 3, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={consensusColor[d.consensus]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Consensus + MoSCoW breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: '0.5px solid var(--border-default)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" innerRadius={18} outerRadius={30} strokeWidth={0}>
                    {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Consensus Health</div>
              <div style={{ fontSize: '0.8125rem' }}>
                <span style={{ color: consensusColor.Strong }}>Strong: {consensusCounts.Strong}</span>{' · '}
                <span style={{ color: consensusColor.Mixed }}>Mixed: {consensusCounts.Mixed}</span>{' · '}
                <span style={{ color: consensusColor.Conflict }}>Conflict: {consensusCounts.Conflict}</span>
              </div>
            </div>
          </div>
          <div style={{ border: '0.5px solid var(--border-default)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>MoSCoW Breakdown</div>
            <ResponsiveContainer width="100%" height={32}>
              <BarChart layout="vertical" data={moscowBarData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="" hide />
                <Bar dataKey="Must" stackId="a" fill={moscowColor.Must} radius={[4, 0, 0, 4]} />
                <Bar dataKey="Should" stackId="a" fill={moscowColor.Should} />
                <Bar dataKey="Could" stackId="a" fill={moscowColor.Could} />
                <Bar dataKey="Won't" stackId="a" fill={moscowColor["Won't"]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.6875rem' }}>
              {Object.entries(moscowCounts).map(([k, v]) => <span key={k} style={{ color: moscowColor[k], fontWeight: 600 }}>{k}: {v}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 6: Appendix ─── */}
      <h3 style={sectionTitle}>6. Appendix — Full Data</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={thStyle}>Feature</th>
              <th style={thStyle}>Scope</th>
              <th style={thStyle}>Value</th>
              <th style={thStyle}>Confidence</th>
              <th style={thStyle}>Complexity</th>
              <th style={thStyle}>Necessity</th>
              <th style={thStyle}>RICE</th>
              <th style={thStyle}>ICE</th>
              <th style={thStyle}>MoSCoW</th>
              <th style={thStyle}>Consensus</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={f.id} style={{ background: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)' }}>
                <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--text-primary)' }}>{f.name}</td>
                <td style={tdStyle}>{SCOPE_LABEL[f.inputs.customerScope]}</td>
                <td style={tdStyle}>{VALUE_LABEL[f.inputs.valueDelivered]}</td>
                <td style={tdStyle}>{CONF_LABEL[f.inputs.confidenceLevel]}</td>
                <td style={tdStyle}>{f.inputs.buildComplexity}</td>
                <td style={tdStyle}>{NECESSITY_LABEL[f.inputs.strategicNecessity]}</td>
                <td style={tdStyle} className="mono">{f.scores.rice.toLocaleString()}</td>
                <td style={tdStyle} className="mono">{f.scores.ice}</td>
                <td style={{ ...tdStyle, color: moscowColor[f.scores.moscow], fontWeight: 600 }}>{f.scores.moscow}</td>
                <td style={{ ...tdStyle, color: consensusColor[f.consensus], fontWeight: 600 }}>{f.consensus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───── Row group (for capacity cutoff) ───── */

function RowGroup({ feature: f, idx, belowCap, isCutoff, capacity }: { feature: Feature; idx: number; belowCap: boolean; isCutoff: boolean; capacity: number | null }) {
  return (
    <>
      {isCutoff && (
        <tr>
          <td colSpan={6} style={{ padding: '8px 10px', position: 'relative' }}>
            <div style={{ borderTop: '2px dashed var(--consensus-conflict)', position: 'relative' }}>
              <span style={{ position: 'absolute', top: -9, left: 0, fontSize: '0.625rem', fontWeight: 600, color: 'var(--consensus-conflict)', background: 'var(--bg-primary)', padding: '0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Capacity cutoff ({capacity})
              </span>
            </div>
          </td>
        </tr>
      )}
      <tr style={{ opacity: belowCap ? 0.5 : 1 }}>
        <td style={tdStyle}>{idx + 1}</td>
        <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--text-primary)' }}>
          {f.name}
          {belowCap && <span style={{ marginLeft: 8, fontSize: '0.625rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>defer</span>}
        </td>
        <td style={tdStyle} className="mono">{f.scores.rice.toLocaleString()}</td>
        <td style={tdStyle} className="mono">{f.scores.ice}</td>
        <td style={{ ...tdStyle, color: moscowColor[f.scores.moscow], fontWeight: 600 }}>{f.scores.moscow}</td>
        <td style={{ ...tdStyle, color: consensusColor[f.consensus], fontWeight: 600 }}>{f.consensus}</td>
      </tr>
    </>
  );
}

/* ───── Action button ───── */

function ActBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 500, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
      {label}
    </button>
  );
}

/* ───── download helper ───── */

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
