import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis, PieChart, Pie,
  ReferenceLine,
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import FeatureDetailPanel from '../../components/FeatureDetailPanel';
import type { ConsensusSignal, ScoringInputs } from '../../types';

/* ───── constants ───── */

const consensusColor: Record<ConsensusSignal, string> = { Strong: '#16A34A', Mixed: '#D97706', Conflict: '#DC2626' };
const moscowColor: Record<string, string> = { Must: '#16A34A', Should: '#2563EB', Could: '#D97706', "Won't": '#9C9B96' };

const EFFORT_NUM: Record<ScoringInputs['buildComplexity'], number> = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
const IMPACT_NUM: Record<ScoringInputs['valueDelivered'], number> = { negligible: 1, minor: 2, moderate: 3, significant: 4, transformative: 5 };

const CARD_STYLE: React.CSSProperties = { background: 'var(--bg-primary)', border: '0.5px solid var(--border-default)', borderRadius: 14, padding: '20px 24px' };

const LS_KEY = 'prioritize-hq-session-count';

/* ───── helper ───── */

function getSessionDelta(current: number): number {
  try {
    const prev = localStorage.getItem(LS_KEY);
    if (prev == null) { localStorage.setItem(LS_KEY, String(current)); return 0; }
    return current - Number(prev);
  } catch { return 0; }
}

/* ───── main ───── */

export default function DashboardTab() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const release = useAppStore((s) => s.releases.find((r) => r.id === releaseId));
  const updateRelease = useAppStore((s) => s.updateRelease);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const [barSortBy, setBarSortBy] = useState<'rice' | 'ice'>('rice');
  const [detailFeatureId, setDetailFeatureId] = useState<string | null>(null);

  const features = release?.features ?? [];
  const total = features.length;
  const capacity = release?.capacity ?? null;

  /* ─── metric calculations ─── */
  const avgRice = useMemo(() => total > 0 ? Math.round(features.reduce((a, f) => a + f.scores.rice, 0) / total) : 0, [features, total]);
  const avgIce = useMemo(() => total > 0 ? Math.round(features.reduce((a, f) => a + f.scores.ice, 0) / total) : 0, [features, total]);
  const avgUnified = useMemo(() => total > 0 ? Math.round(features.reduce((a, f) => a + (f.scores.unifiedScore ?? 0), 0) / total) : 0, [features, total]);
  const sessionDelta = useMemo(() => getSessionDelta(total), [total]);

  const consensusCounts = useMemo(() => {
    const c: Record<ConsensusSignal, number> = { Strong: 0, Mixed: 0, Conflict: 0 };
    features.forEach((f) => c[f.consensus]++);
    return c;
  }, [features]);
  const agreementPct = total > 0 ? Math.round((consensusCounts.Strong / total) * 100) : 0;

  const moscowCounts = useMemo(() => {
    const c: Record<string, number> = { Must: 0, Should: 0, Could: 0, "Won't": 0 };
    features.forEach((f) => c[f.scores.moscow]++);
    return c;
  }, [features]);

  /* ─── chart data ─── */
  const barData = useMemo(() => {
    const sorted = [...features].sort((a, b) => barSortBy === 'rice' ? b.scores.rice - a.scores.rice : b.scores.ice - a.scores.ice);
    return sorted.map((f) => ({ id: f.id, name: f.name.length > 24 ? f.name.slice(0, 22) + '…' : f.name, score: barSortBy === 'rice' ? f.scores.rice : f.scores.ice, consensus: f.consensus }));
  }, [features, barSortBy]);

  const scatterData = useMemo(() => features.map((f) => ({
    id: f.id,
    name: f.name,
    x: 6 - EFFORT_NUM[f.inputs.buildComplexity], // reversed: easy=left (high x)
    y: IMPACT_NUM[f.inputs.valueDelivered],
    z: Math.max(40, Math.min(200, f.scores.rice / 100)),
    color: consensusColor[f.consensus],
    rice: f.scores.rice,
    ice: f.scores.ice,
  })), [features]);

  const heatmapData = useMemo(() => {
    return [...features].sort((a, b) => {
      const order: Record<ConsensusSignal, number> = { Conflict: 0, Mixed: 1, Strong: 2 };
      return order[a.consensus] - order[b.consensus];
    });
  }, [features]);

  const donutData = useMemo(() => [
    { name: 'Strong', value: consensusCounts.Strong, fill: consensusColor.Strong },
    { name: 'Mixed', value: consensusCounts.Mixed, fill: consensusColor.Mixed },
    { name: 'Conflict', value: consensusCounts.Conflict, fill: consensusColor.Conflict },
  ], [consensusCounts]);

  const moscowBarData = useMemo(() => [{ Must: moscowCounts.Must, Should: moscowCounts.Should, Could: moscowCounts.Could, "Won't": moscowCounts["Won't"] }], [moscowCounts]);

  const capacityUsed = capacity != null && capacity > 0 ? total : 0;

  if (!release || !releaseId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── Metric cards ─── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Total features */}
        <div style={{ ...CARD_STYLE, flex: '1 1 200px' }}>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{total}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Features scored</div>
          {sessionDelta !== 0 && <div style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)', marginTop: 4 }}>+{sessionDelta} since last session</div>}
        </div>

        {/* Avg Unified */}
        <div style={{ ...CARD_STYLE, flex: '1 1 200px' }}>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{avgUnified}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Avg Unified score</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4 }}>RICE avg: {avgRice.toLocaleString()} | ICE avg: {avgIce.toLocaleString()}</div>
        </div>

        {/* Capacity */}
        <div style={{ ...CARD_STYLE, flex: '1 1 200px' }}>
          {capacity != null && capacity > 0 ? (
            <>
              <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{capacityUsed} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {capacity}</span></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Capacity used</div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', marginTop: 8 }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(100, (capacityUsed / capacity) * 100)}%`, background: capacityUsed > capacity ? 'var(--consensus-conflict)' : 'var(--consensus-strong)', transition: 'width 0.3s' }} />
              </div>
            </>
          ) : (
            <>
              <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>—</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Capacity used</div>
              <button onClick={() => updateRelease(releaseId, { capacity: total || 10 })} style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>Set capacity</button>
            </>
          )}
        </div>

        {/* Consensus health */}
        <div style={{ ...CARD_STYLE, flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={14} outerRadius={22} strokeWidth={0}>
                  {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Consensus health</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{agreementPct}% agreement</div>
          </div>
        </div>
      </div>

      {/* ─── Charts grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Chart 1: Score distribution */}
        <div style={{ ...CARD_STYLE, gridRow: 'span 2', minHeight: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Score distribution</div>
            <button
              onClick={() => setBarSortBy((v) => v === 'rice' ? 'ice' : 'rice')}
              style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--accent-primary)', background: 'none', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', cursor: 'pointer' }}
            >
              {barSortBy === 'rice' ? 'RICE' : 'ICE'}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 32)}>
            <BarChart layout="vertical" data={barData} margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9C9B96' }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: '#5C5B57' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E4E3DF' }} />
              {capacity != null && capacity > 0 && (
                <ReferenceLine y={capacity - 0.5} stroke="#DC2626" strokeDasharray="4 4" strokeOpacity={0.4} />
              )}
              <Bar dataKey="score" radius={[0, 4, 4, 0]} onClick={(d) => { if (d && d.id) setDetailFeatureId(d.id as string); }}>
                {barData.map((d, i) => <Cell key={i} fill={consensusColor[d.consensus]} cursor="pointer" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Priority matrix */}
        <div style={{ ...CARD_STYLE, minHeight: 240 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Priority matrix</div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis type="number" dataKey="x" domain={[0, 5]} tick={{ fontSize: 10, fill: '#9C9B96' }} label={{ value: '← Hard — Easy →', position: 'insideBottom', offset: -12, fontSize: 10, fill: '#9C9B96' }} />
              <YAxis type="number" dataKey="y" domain={[0, 5]} tick={{ fontSize: 10, fill: '#9C9B96' }} label={{ value: 'Impact ↑', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9C9B96' }} />
              <ZAxis type="number" dataKey="z" range={[40, 200]} />
              <Tooltip content={<MatrixTooltip />} />
              <Scatter data={scatterData} onClick={(_d, _i, e) => { const node = (e as unknown as { payload?: { id?: string } })?.payload; if (node?.id) setDetailFeatureId(node.id); }}>
                {scatterData.map((d, i) => <Cell key={i} fill={d.color} cursor="pointer" />)}
              </Scatter>
              {/* Quadrant labels via reference */}
              <ReferenceLine x={2.5} stroke="var(--border-default)" strokeDasharray="2 2" />
              <ReferenceLine y={2.5} stroke="var(--border-default)" strokeDasharray="2 2" />
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 4, padding: '0 8px' }}>
            <span>Quick wins ↖</span>
            <span>Big bets ↗</span>
            <span>Fill-ins ↙</span>
            <span>Money pits ↘</span>
          </div>
        </div>

        {/* Chart 3: Framework heatmap */}
        <div style={{ ...CARD_STYLE, minHeight: 200, overflowX: 'auto' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Framework heatmap</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th style={heatTh}>Feature</th>
                <th style={heatTh}>RICE #</th>
                <th style={heatTh}>ICE #</th>
                <th style={heatTh}>MoSCoW</th>
                <th style={heatTh}>Δ</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((f) => {
                const riceIntensity = total > 0 ? 1 - ((f.scores.riceRank ?? total) - 1) / total : 0;
                const iceIntensity = total > 0 ? 1 - ((f.scores.iceRank ?? total) - 1) / total : 0;
                return (
                  <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => setDetailFeatureId(f.id)}>
                    <td style={{ ...heatTd, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</td>
                    <td style={{ ...heatTd, background: `rgba(37,99,235,${riceIntensity * 0.25})`, textAlign: 'center' }}>#{f.scores.riceRank ?? '?'}</td>
                    <td style={{ ...heatTd, background: `rgba(37,99,235,${iceIntensity * 0.25})`, textAlign: 'center' }}>#{f.scores.iceRank ?? '?'}</td>
                    <td style={{ ...heatTd, textAlign: 'center', color: moscowColor[f.scores.moscow], fontWeight: 600 }}>{f.scores.moscow}</td>
                    <td style={{ ...heatTd, textAlign: 'center' }} title={`Consensus: ${f.consensus}`}>
                      {f.consensus === 'Strong' && <span style={{ color: consensusColor.Strong }}>✓</span>}
                      {f.consensus === 'Mixed' && <span style={{ color: consensusColor.Mixed }}>⚠</span>}
                      {f.consensus === 'Conflict' && <span style={{ color: consensusColor.Conflict }}>✗</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {heatmapData.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: 16 }}>No features yet</p>}
        </div>
      </div>

      {/* ─── Chart 4: MoSCoW breakdown ─── */}
      <div style={{ ...CARD_STYLE }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>MoSCoW breakdown</div>
        <ResponsiveContainer width="100%" height={40}>
          <BarChart layout="vertical" data={moscowBarData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="" hide />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E4E3DF' }} />
            <Bar dataKey="Must" stackId="a" fill={moscowColor.Must} radius={[4, 0, 0, 4]} onClick={() => { setActiveTab('rankings'); }} cursor="pointer" />
            <Bar dataKey="Should" stackId="a" fill={moscowColor.Should} onClick={() => { setActiveTab('rankings'); }} cursor="pointer" />
            <Bar dataKey="Could" stackId="a" fill={moscowColor.Could} onClick={() => { setActiveTab('rankings'); }} cursor="pointer" />
            <Bar dataKey="Won't" stackId="a" fill={moscowColor["Won't"]} radius={[0, 4, 4, 0]} onClick={() => { setActiveTab('rankings'); }} cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.6875rem' }}>
          {Object.entries(moscowCounts).map(([k, v]) => (
            <span key={k} style={{ color: moscowColor[k], fontWeight: 600 }}>{k}: {v}</span>
          ))}
        </div>
        {moscowCounts.Must > 0 && capacity != null && capacity > 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            {moscowCounts.Must} must-have{moscowCounts.Must > 1 ? 's' : ''} consume{moscowCounts.Must === 1 ? 's' : ''} {Math.round((moscowCounts.Must / capacity) * 100)}% of capacity.
          </p>
        )}
      </div>

      {/* ─── Feature detail panel ─── */}
      {detailFeatureId && <FeatureDetailPanel featureId={detailFeatureId} onClose={() => setDetailFeatureId(null)} />}
    </div>
  );
}

/* ───── custom tooltip ───── */

function MatrixTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; rice: number; ice: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem' }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</div>
      <div style={{ color: 'var(--text-secondary)' }}>RICE: {d.rice.toLocaleString()} · ICE: {d.ice}</div>
    </div>
  );
}

/* ───── heatmap styles ───── */

const heatTh: React.CSSProperties = { textAlign: 'left', padding: '6px 8px', fontWeight: 600, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' };
const heatTd: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid var(--border-default)' };
