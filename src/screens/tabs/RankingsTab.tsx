import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil, Copy, Trash2, Lock, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import type { Feature, ConsensusSignal, FrameworkScores, ScoringInputs } from '../../types';

/* ───── lookup maps ───── */

const REACH: Record<ScoringInputs['customerScope'], number> = { all: 10000, enterprise: 5000, committed: 2000, internal: 500 };
const IMPACT_RICE: Record<ScoringInputs['valueDelivered'], number> = { transformative: 3, significant: 2, moderate: 1, minor: 0.5, negligible: 0.25 };
const CONFIDENCE_RICE: Record<ScoringInputs['confidenceLevel'], number> = { validated: 1.0, strong_hunch: 0.8, guess: 0.5, speculative: 0.3 };
const EFFORT: Record<ScoringInputs['buildComplexity'], number> = { S: 0.25, M: 0.5, L: 2, XL: 3, XXL: 6 };

const IMPACT_ICE: Record<ScoringInputs['valueDelivered'], number> = { transformative: 10, significant: 8, moderate: 6, minor: 4, negligible: 2 };
const SCOPE_MOD: Record<ScoringInputs['customerScope'], number> = { all: 1, enterprise: 0, committed: -1, internal: -2 };
const CONFIDENCE_ICE: Record<ScoringInputs['confidenceLevel'], number> = { validated: 10, strong_hunch: 8, guess: 5, speculative: 3 };
const EASE: Record<ScoringInputs['buildComplexity'], number> = { S: 10, M: 8, L: 5, XL: 3, XXL: 1 };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const SCOPE_LABEL: Record<ScoringInputs['customerScope'], string> = { all: 'All', enterprise: 'Enterprise', committed: 'Committed', internal: 'Internal' };
const VALUE_LABEL: Record<ScoringInputs['valueDelivered'], string> = { transformative: 'Transformative', significant: 'Significant', moderate: 'Moderate', minor: 'Minor', negligible: 'Negligible' };
const CONF_PCT: Record<ScoringInputs['confidenceLevel'], string> = { validated: '100%', strong_hunch: '80%', guess: '50%', speculative: '30%' };

const consensusColor: Record<ConsensusSignal, string> = { Strong: 'var(--consensus-strong)', Mixed: 'var(--consensus-mixed)', Conflict: 'var(--consensus-conflict)' };
const consensusBg: Record<ConsensusSignal, string> = { Strong: 'var(--consensus-strong-surface)', Mixed: 'var(--consensus-mixed-surface)', Conflict: 'var(--consensus-conflict-surface)' };
const moscowColor: Record<FrameworkScores['moscow'], string> = { Must: 'var(--moscow-must)', Should: 'var(--moscow-should)', Could: 'var(--moscow-could)', "Won't": 'var(--moscow-wont)' };
const impactDot: Record<ScoringInputs['valueDelivered'], string> = { transformative: 'var(--consensus-strong)', significant: 'var(--accent-primary)', moderate: 'var(--consensus-mixed)', minor: 'var(--text-muted)', negligible: 'var(--text-placeholder)' };

/* ───── sort / filter types ───── */

type SortKey = 'unified' | 'consensus' | 'rice' | 'ice' | 'moscow' | 'dateAdded' | 'name' | 'scope' | 'impact' | 'confidence' | 'effort';
type FilterTag = 'All' | 'Must' | 'Should' | 'Could' | "Won't" | 'Strong' | 'Mixed' | 'Conflict';
type ViewMode = 'compact' | 'comfortable';

const MOSCOW_ORDER: Record<string, number> = { Must: 0, Should: 1, Could: 2, "Won't": 3 };
const CONSENSUS_ORDER: Record<string, number> = { Strong: 0, Mixed: 1, Conflict: 2 };
const VALUE_ORDER: Record<string, number> = { transformative: 0, significant: 1, moderate: 2, minor: 3, negligible: 4 };
const COMPLEXITY_ORDER: Record<string, number> = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };

const FILTER_TAGS: FilterTag[] = ['All', 'Must', 'Should', 'Could', "Won't", 'Strong', 'Mixed', 'Conflict'];

/* ───── helpers ───── */

function scoreQuartileColor(rank: number | undefined, total: number) {
  if (rank == null || total === 0) return 'var(--text-primary)';
  const pct = rank / total;
  if (pct <= 0.25) return 'var(--consensus-strong)';
  if (pct <= 0.75) return 'var(--consensus-mixed)';
  return 'var(--text-muted)';
}

function consensusTooltip(f: Feature, _total: number) {
  const rr = f.scores.riceRank ?? '?';
  const ir = f.scores.iceRank ?? '?';
  const agree = f.consensus === 'Strong' ? 'Frameworks agree.' : f.consensus === 'Conflict' ? 'Frameworks disagree.' : 'Frameworks partially agree.';
  return `RICE ranks #${rr}, ICE ranks #${ir}, MoSCoW: ${f.scores.moscow}. ${agree}`;
}

function useDebounce(value: string, ms: number) {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return d;
}

/* ───── main component ───── */

export default function RankingsTab() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const release = useAppStore((s) => s.releases.find((r) => r.id === releaseId));
  const updateRelease = useAppStore((s) => s.updateRelease);
  const deleteFeature = useAppStore((s) => s.deleteFeature);
  const duplicateFeature = useAppStore((s) => s.duplicateFeature);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const [sortKey, setSortKey] = useState<SortKey>('unified');
  const [sortAsc, setSortAsc] = useState(false);
  const [filters, setFilters] = useState<Set<FilterTag>>(new Set(['All']));
  const [searchRaw, setSearchRaw] = useState('');
  const search = useDebounce(searchRaw, 300);
  const [view, setView] = useState<ViewMode>('comfortable');
  const [showCutoff, setShowCutoff] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Capacity drag
  const dragRef = useRef<{ startY: number; startCap: number } | null>(null);

  const features = release?.features ?? [];
  const total = features.length;
  const capacity = release?.capacity ?? null;

  /* filter */
  const filtered = useMemo(() => {
    let list = features;
    if (!filters.has('All')) {
      list = list.filter((f) => {
        const moscowMatch = (filters.has('Must') && f.scores.moscow === 'Must')
          || (filters.has('Should') && f.scores.moscow === 'Should')
          || (filters.has('Could') && f.scores.moscow === 'Could')
          || (filters.has("Won't") && f.scores.moscow === "Won't");
        const consMatch = (filters.has('Strong') && f.consensus === 'Strong')
          || (filters.has('Mixed') && f.consensus === 'Mixed')
          || (filters.has('Conflict') && f.consensus === 'Conflict');
        return moscowMatch || consMatch;
      });
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    return list;
  }, [features, filters, search]);

  /* sort */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortAsc ? 1 : -1;
    arr.sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'unified': diff = (a.scores.unifiedScore ?? 0) - (b.scores.unifiedScore ?? 0); break;
        case 'rice': diff = a.scores.rice - b.scores.rice; break;
        case 'ice': diff = a.scores.ice - b.scores.ice; break;
        case 'moscow': diff = MOSCOW_ORDER[a.scores.moscow] - MOSCOW_ORDER[b.scores.moscow]; break;
        case 'consensus': diff = CONSENSUS_ORDER[a.consensus] - CONSENSUS_ORDER[b.consensus]; break;
        case 'dateAdded': diff = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(); break;
        case 'name': diff = a.name.localeCompare(b.name); break;
        case 'scope': diff = a.inputs.customerScope.localeCompare(b.inputs.customerScope); break;
        case 'impact': diff = VALUE_ORDER[a.inputs.valueDelivered] - VALUE_ORDER[b.inputs.valueDelivered]; break;
        case 'confidence': diff = (CONFIDENCE_RICE[a.inputs.confidenceLevel] ?? 0) - (CONFIDENCE_RICE[b.inputs.confidenceLevel] ?? 0); break;
        case 'effort': diff = COMPLEXITY_ORDER[a.inputs.buildComplexity] - COMPLEXITY_ORDER[b.inputs.buildComplexity]; break;
      }
      return diff * dir;
    });
    return arr;
  }, [filtered, sortKey, sortAsc]);

  /* handlers */
  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => { if (prev === key) { setSortAsc((a) => !a); } else { setSortAsc(false); } return key; });
  }, []);

  const toggleFilter = useCallback((tag: FilterTag) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (tag === 'All') return new Set(['All']);
      next.delete('All');
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next.size === 0 ? new Set<FilterTag>(['All']) : next;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (!releaseId) return;
    selected.forEach((id) => deleteFeature(releaseId, id));
    setSelected(new Set());
  }, [releaseId, selected, deleteFeature]);

  const handleEditFeature = useCallback((_featureId: string) => {
    setActiveTab('add-edit');
  }, [setActiveTab]);

  /* capacity drag */
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startCap: capacity ?? 0 };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current || !releaseId) return;
      const dy = ev.clientY - dragRef.current.startY;
      const rowH = view === 'compact' ? 36 : 48;
      const delta = Math.round(dy / rowH);
      const newCap = Math.max(0, dragRef.current.startCap + delta);
      updateRelease(releaseId, { capacity: newCap });
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [capacity, releaseId, view, updateRelease]);

  if (!release || !releaseId) return null;

  const cellPy = view === 'compact' ? '4px' : '10px';

  return (
    <div>
      {/* Controls bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 4, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-default)', padding: '10px 0', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        {/* Sort dropdown */}
        <select
          value={sortKey}
          onChange={(e) => { setSortKey(e.target.value as SortKey); setSortAsc(false); }}
          style={{ padding: '6px 10px', fontSize: '0.8125rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
        >
          <option value="unified">Unified score</option>
          <option value="consensus">Consensus</option>
          <option value="rice">RICE score</option>
          <option value="ice">ICE score</option>
          <option value="moscow">MoSCoW</option>
          <option value="dateAdded">Date added</option>
        </select>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {FILTER_TAGS.map((tag) => {
            const active = filters.has(tag);
            return (
              <button key={tag} onClick={() => toggleFilter(tag)} style={{
                padding: '4px 10px', fontSize: '0.75rem', fontWeight: 500, borderRadius: '9999px', cursor: 'pointer', border: '1px solid var(--border-default)', transition: 'all 0.12s',
                background: active ? 'var(--accent-surface)' : 'var(--bg-primary)', color: active ? 'var(--accent-primary)' : 'var(--text-secondary)', borderColor: active ? 'var(--accent-primary)' : 'var(--border-default)',
              }}>
                {tag}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <input
          value={searchRaw}
          onChange={(e) => setSearchRaw(e.target.value)}
          placeholder="Search features…"
          style={{ padding: '6px 10px', fontSize: '0.8125rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: 180 }}
        />

        {/* View toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {(['compact', 'comfortable'] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setView(m)} style={{
              padding: '4px 10px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', border: 'none',
              background: view === m ? 'var(--accent-surface)' : 'var(--bg-primary)', color: view === m ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Cutoff toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showCutoff} onChange={(e) => setShowCutoff(e.target.checked)} /> Capacity cutoff
        </label>

        {/* Select mode */}
        <button onClick={() => { setSelectMode((v) => !v); setSelected(new Set()); }} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 500, borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border-default)', background: selectMode ? 'var(--accent-surface)' : 'var(--bg-primary)', color: selectMode ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
          {selectMode ? 'Cancel' : 'Select'}
        </button>

        {/* Bulk actions */}
        {selectMode && selected.size > 0 && (
          <button onClick={handleBulkDelete} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 500, borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', background: 'var(--consensus-conflict)', color: '#fff' }}>
            Delete {selected.size}
          </button>
        )}
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No features match your filters</p>
          <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>Try adjusting the filter or search terms.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                {selectMode && <Th />}
                <Th sortKey="unified" current={sortKey} asc={sortAsc} onClick={toggleSort} w={40}>#</Th>
                <Th sortKey="unified" current={sortKey} asc={sortAsc} onClick={toggleSort} w={90}>Unified</Th>
                <Th sortKey="name" current={sortKey} asc={sortAsc} onClick={toggleSort} w={undefined}>Feature</Th>
                <Th sortKey="consensus" current={sortKey} asc={sortAsc} onClick={toggleSort} w={100}>Consensus</Th>
                <Th sortKey="rice" current={sortKey} asc={sortAsc} onClick={toggleSort} w={90}>RICE</Th>
                <Th sortKey="ice" current={sortKey} asc={sortAsc} onClick={toggleSort} w={90}>ICE</Th>
                <Th sortKey="moscow" current={sortKey} asc={sortAsc} onClick={toggleSort} w={80}>MoSCoW</Th>
                <Th sortKey="scope" current={sortKey} asc={sortAsc} onClick={toggleSort} w={80}>Scope</Th>
                <Th sortKey="impact" current={sortKey} asc={sortAsc} onClick={toggleSort} w={100}>Impact</Th>
                <Th sortKey="confidence" current={sortKey} asc={sortAsc} onClick={toggleSort} w={80}>Confidence</Th>
                <Th sortKey="effort" current={sortKey} asc={sortAsc} onClick={toggleSort} w={60}>Effort</Th>
                <Th w={80}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((f, idx) => {
                const rank = idx + 1;
                const isHovered = hoveredRow === f.id;
                const belowCap = showCutoff && capacity != null && capacity > 0 && rank > capacity;
                const isCutoffRow = showCutoff && capacity != null && capacity > 0 && rank === capacity + 1;
                const isExpanded = expandedId === f.id;

                return (
                  <FeatureRows
                    key={f.id}
                    feature={f}
                    rank={rank}
                    total={total}
                    isHovered={isHovered}
                    belowCap={belowCap}
                    isCutoffRow={isCutoffRow}
                    isExpanded={isExpanded}
                    cellPy={cellPy}
                    selectMode={selectMode}
                    isSelected={selected.has(f.id)}
                    onHover={setHoveredRow}
                    onToggleExpand={() => setExpandedId(isExpanded ? null : f.id)}
                    onEdit={() => handleEditFeature(f.id)}
                    onDuplicate={() => duplicateFeature(releaseId, f.id)}
                    onDelete={() => deleteFeature(releaseId, f.id)}
                    onToggleSelect={() => toggleSelect(f.id)}
                    onDragStart={onDragStart}
                    capacity={capacity}
                    sortKey={sortKey}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───── Table header cell ───── */

function Th({ children, sortKey: sk, current, asc, onClick, w }: {
  children?: React.ReactNode; sortKey?: SortKey; current?: SortKey; asc?: boolean; onClick?: (k: SortKey) => void; w?: number;
}) {
  const active = sk != null && sk === current;
  return (
    <th
      onClick={sk && onClick ? () => onClick(sk) : undefined}
      style={{
        position: 'sticky', top: 0, zIndex: 3, background: 'var(--bg-primary)', textAlign: 'left', padding: '8px 6px',
        fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.5px',
        color: active ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: sk ? 'pointer' : 'default',
        borderBottom: '1px solid var(--border-default)', whiteSpace: 'nowrap', width: w,
        userSelect: 'none',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        {children}
        {active && (asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </span>
    </th>
  );
}

/* ───── Feature rows (data + optional cutoff + optional detail) ───── */

function FeatureRows({ feature: f, rank, total, isHovered, belowCap, isCutoffRow, isExpanded, cellPy, selectMode, isSelected, sortKey: _sk, onHover, onToggleExpand, onEdit, onDuplicate, onDelete, onToggleSelect, onDragStart, capacity }: {
  feature: Feature; rank: number; total: number; isHovered: boolean; belowCap: boolean; isCutoffRow: boolean; isExpanded: boolean;
  cellPy: string; selectMode: boolean; isSelected: boolean; sortKey: SortKey;
  onHover: (id: string | null) => void; onToggleExpand: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void; onToggleSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void; capacity: number | null;
}) {
  const cellSt: React.CSSProperties = { padding: `${cellPy} 6px`, verticalAlign: 'middle', transition: 'opacity 0.2s' };
  const rowOpacity = belowCap ? 0.5 : 1;

  const dateAgo = (() => { try { return formatDistanceToNow(new Date(f.dateAdded), { addSuffix: true }); } catch { return ''; } })();

  const rows: React.ReactNode[] = [];

  // Cutoff row
  if (isCutoffRow) {
    const colSpan = selectMode ? 13 : 12;
    rows.push(
      <tr key="cutoff" style={{ height: 28 }}>
        <td colSpan={colSpan} style={{ padding: '0 6px', position: 'relative' }}>
          <div style={{ borderTop: '2px dashed var(--consensus-conflict)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -10, left: 0, fontSize: '0.625rem', fontWeight: 600, color: 'var(--consensus-conflict)', background: 'var(--bg-primary)', padding: '0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Below capacity ({capacity})
            </span>
            <span
              onMouseDown={onDragStart}
              style={{ position: 'absolute', top: -8, right: 8, cursor: 'ns-resize', fontSize: '0.75rem', color: 'var(--text-muted)', userSelect: 'none', lineHeight: 1 }}
              title="Drag to adjust capacity"
            >
              ⋮⋮
            </span>
          </div>
        </td>
      </tr>,
    );
  }

  // Data row
  rows.push(
    <tr
      key={f.id}
      onMouseEnter={() => onHover(f.id)}
      onMouseLeave={() => onHover(null)}
      style={{ borderBottom: '1px solid var(--border-default)', background: isHovered ? 'var(--bg-secondary)' : 'transparent', opacity: rowOpacity, transition: 'background 0.12s, opacity 0.2s' }}
    >
      {selectMode && (
        <td style={cellSt}><input type="checkbox" checked={isSelected} onChange={onToggleSelect} /></td>
      )}
      {/* # */}
      <td style={cellSt}>
        {rank <= 3 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: '0.6875rem', fontWeight: 700 }}>{rank}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{rank}</span>
        )}
      </td>
      {/* Unified */}
      <td style={cellSt}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="mono" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{f.scores.unifiedScore ?? 0}</span>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', width: '100%' }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${f.scores.unifiedScore ?? 0}%`, background: 'var(--accent-primary)', transition: 'width 0.3s' }} />
          </div>
        </div>
      </td>
      {/* Feature */}
      <td style={cellSt}>
        <div onClick={onToggleExpand} style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{f.name}</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{dateAgo}</div>
        </div>
      </td>
      {/* Consensus */}
      <td style={cellSt}>
        <span title={consensusTooltip(f, total)} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, color: consensusColor[f.consensus], background: consensusBg[f.consensus] }}>
          {f.consensus}
        </span>
      </td>
      {/* RICE */}
      <td style={cellSt}>
        <span className="mono" style={{ fontWeight: 600, color: scoreQuartileColor(f.scores.riceRank, total) }}>{f.scores.rice.toLocaleString()}</span>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>#{f.scores.riceRank ?? '?'} of {total}</div>
      </td>
      {/* ICE */}
      <td style={cellSt}>
        <span className="mono" style={{ fontWeight: 600, color: scoreQuartileColor(f.scores.iceRank, total) }}>{f.scores.ice.toLocaleString()}</span>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>#{f.scores.iceRank ?? '?'} of {total}</div>
      </td>
      {/* MoSCoW */}
      <td style={cellSt}>
        <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, color: moscowColor[f.scores.moscow], border: `1px solid ${moscowColor[f.scores.moscow]}` }}>
          {f.scores.moscow}
        </span>
      </td>
      {/* Scope */}
      <td style={{ ...cellSt, color: 'var(--text-secondary)' }}>{SCOPE_LABEL[f.inputs.customerScope]}</td>
      {/* Impact */}
      <td style={cellSt}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: impactDot[f.inputs.valueDelivered] }} />
          <span style={{ color: 'var(--text-secondary)' }}>{VALUE_LABEL[f.inputs.valueDelivered]}</span>
        </span>
      </td>
      {/* Confidence */}
      <td style={{ ...cellSt, color: 'var(--text-secondary)' }} className="mono">{CONF_PCT[f.inputs.confidenceLevel]}</td>
      {/* Effort */}
      <td style={{ ...cellSt, color: 'var(--text-secondary)', fontWeight: 600 }}>{f.inputs.buildComplexity}</td>
      {/* Actions */}
      <td style={cellSt}>
        <div style={{ display: 'flex', gap: 4, visibility: isHovered ? 'visible' : 'hidden' }}>
          <ActionBtn icon={<Pencil size={13} />} title="Edit" onClick={onEdit} />
          <ActionBtn icon={<Copy size={13} />} title="Duplicate" onClick={onDuplicate} />
          <ActionBtn icon={<Trash2 size={13} />} title="Delete" onClick={onDelete} color="var(--consensus-conflict)" />
        </div>
      </td>
    </tr>,
  );

  // Expanded detail
  if (isExpanded) {
    const colSpan = selectMode ? 13 : 12;
    rows.push(
      <tr key={`${f.id}-detail`}>
        <td colSpan={colSpan} style={{ padding: 0, borderBottom: '1px solid var(--border-default)' }}>
          <DetailPanel feature={f} total={total} />
        </td>
      </tr>,
    );
  }

  return <>{rows}</>;
}

/* ───── Action button ───── */

function ActionBtn({ icon, title, onClick, color }: { icon: React.ReactNode; title: string; onClick: () => void; color?: string }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} title={title} style={{ background: 'none', border: 'none', cursor: 'pointer', color: color ?? 'var(--text-muted)', padding: 2 }}>
      {icon}
    </button>
  );
}

/* ───── Detail panel ───── */

function DetailPanel({ feature: f, total }: { feature: Feature; total: number }) {
  const inp = f.inputs;
  const reach = REACH[inp.customerScope];
  const impactR = IMPACT_RICE[inp.valueDelivered];
  const confR = CONFIDENCE_RICE[inp.confidenceLevel];
  const effort = EFFORT[inp.buildComplexity];

  const impactI = clamp(IMPACT_ICE[inp.valueDelivered] + SCOPE_MOD[inp.customerScope], 1, 10);
  const confI = CONFIDENCE_ICE[inp.confidenceLevel];
  const ease = EASE[inp.buildComplexity];

  const riceRank = f.scores.riceRank ?? 0;
  const iceRank = f.scores.iceRank ?? 0;

  return (
    <div style={{ display: 'flex', gap: 24, padding: '16px 24px', background: 'var(--bg-secondary)', flexWrap: 'wrap' }}>
      {/* Left 60% — derivation math */}
      <div style={{ flex: '3 1 360px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* RICE derivation */}
        <DerivationCard title="RICE" result={f.scores.rice} steps={[
          { label: 'Reach', value: reach.toLocaleString() },
          { label: 'Impact', value: String(impactR) },
          { label: 'Confidence', value: String(confR) },
          { label: 'Effort (mo)', value: String(effort) },
        ]} formula={`${reach.toLocaleString()} \u00D7 ${impactR} \u00D7 ${confR} \u00F7 ${effort} = ${f.scores.rice.toLocaleString()}`} />

        {/* ICE derivation */}
        <DerivationCard title="ICE" result={f.scores.ice} steps={[
          { label: 'Impact', value: String(impactI) },
          { label: 'Confidence', value: String(confI) },
          { label: 'Ease', value: String(ease) },
        ]} formula={`${impactI} \u00D7 ${confI} \u00D7 ${ease} = ${f.scores.ice}`} />

        {/* MoSCoW */}
        <div style={{ flex: '1 1 140px', padding: '12px 16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>MoSCoW</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: moscowColor[f.scores.moscow] }}>{f.scores.moscow}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Based on: {inp.strategicNecessity.replace(/_/g, ' ')}</div>
        </div>
      </div>

      {/* Right 40% — thermometer + placeholder */}
      <div style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Score thermometer */}
        <div style={{ padding: '12px 16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Rank position</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Thermometer label="RICE" rank={riceRank} total={total} />
            <Thermometer label="ICE" rank={iceRank} total={total} />
          </div>
        </div>

        {/* V2 placeholder */}
        <div style={{ padding: '12px 16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: 10, opacity: 0.6 }}>
          <Lock size={16} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>AI Audit</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Available in Pro</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Derivation card ───── */

function DerivationCard({ title, result, steps, formula }: {
  title: string; result: number; steps: { label: string; value: string }[]; formula: string;
}) {
  return (
    <div style={{ flex: '1 1 160px', padding: '12px 16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{title}</div>
      <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.toLocaleString()}</div>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {steps.map((s) => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            <span className="mono" style={{ color: 'var(--text-secondary)' }}>{s.value}</span>
          </div>
        ))}
      </div>
      <div className="mono" style={{ marginTop: 8, fontSize: '0.6875rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)', paddingTop: 6 }}>{formula}</div>
    </div>
  );
}

/* ───── Thermometer ───── */

function Thermometer({ label, rank, total }: { label: string; rank: number; total: number }) {
  const pct = total > 0 ? ((total - rank + 1) / total) * 100 : 0;
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ height: 80, width: 20, margin: '0 auto', background: 'var(--bg-tertiary)', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${pct}%`, background: 'var(--accent-primary)', borderRadius: 10, transition: 'height 0.3s' }} />
      </div>
      <div className="mono" style={{ fontSize: '0.6875rem', marginTop: 4, color: 'var(--text-secondary)' }}>#{rank}</div>
    </div>
  );
}
