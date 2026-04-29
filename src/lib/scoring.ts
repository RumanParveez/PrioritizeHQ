import type { ScoringInputs, FrameworkScores, ConsensusSignal, Feature } from '../types';

const REACH: Record<ScoringInputs['customerScope'], number> = {
  all: 10000,
  enterprise: 5000,
  committed: 2000,
  internal: 500,
};

const IMPACT_RICE: Record<ScoringInputs['valueDelivered'], number> = {
  transformative: 3,
  significant: 2,
  moderate: 1,
  minor: 0.5,
  negligible: 0.25,
};

const CONFIDENCE_RICE: Record<ScoringInputs['confidenceLevel'], number> = {
  validated: 1.0,
  strong_hunch: 0.8,
  guess: 0.5,
  speculative: 0.3,
};

const EFFORT: Record<ScoringInputs['buildComplexity'], number> = {
  S: 0.25,
  M: 0.5,
  L: 2,
  XL: 3,
  XXL: 6,
};

const IMPACT_ICE: Record<ScoringInputs['valueDelivered'], number> = {
  transformative: 10,
  significant: 8,
  moderate: 6,
  minor: 4,
  negligible: 2,
};

const SCOPE_MODIFIER: Record<ScoringInputs['customerScope'], number> = {
  all: 1,
  enterprise: 0,
  committed: -1,
  internal: -2,
};

const CONFIDENCE_ICE: Record<ScoringInputs['confidenceLevel'], number> = {
  validated: 10,
  strong_hunch: 8,
  guess: 5,
  speculative: 3,
};

const EASE: Record<ScoringInputs['buildComplexity'], number> = {
  S: 10,
  M: 8,
  L: 5,
  XL: 3,
  XXL: 1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function safeScore(value: number): number {
  if (!Number.isFinite(value)) {
    console.warn('[scoring] Non-finite score clamped to 0:', value);
    return 0;
  }
  return value;
}

export function calculateRICE(inputs: ScoringInputs): number {
  const reach = REACH[inputs.customerScope];
  const impact = IMPACT_RICE[inputs.valueDelivered];
  const confidence = CONFIDENCE_RICE[inputs.confidenceLevel];
  const effort = EFFORT[inputs.buildComplexity];
  return safeScore(Math.round((reach * impact * confidence) / effort));
}

export function calculateICE(inputs: ScoringInputs): number {
  const baseImpact = IMPACT_ICE[inputs.valueDelivered];
  const modifier = SCOPE_MODIFIER[inputs.customerScope];
  const impact = clamp(baseImpact + modifier, 1, 10);
  const confidence = CONFIDENCE_ICE[inputs.confidenceLevel];
  const ease = EASE[inputs.buildComplexity];
  return safeScore(Math.round(impact * confidence * ease));
}

export function calculateMoSCoW(inputs: ScoringInputs): FrameworkScores['moscow'] {
  switch (inputs.strategicNecessity) {
    case 'commitment':
    case 'competitive':
      return 'Must';
    case 'differentiator':
      return 'Should';
    case 'user_requested':
      return 'Could';
    case 'speculative_bet':
      return inputs.confidenceLevel === 'speculative' ? "Won't" : 'Could';
    case 'internal':
      return "Won't";
  }
}

function getQuartile(rank: number, total: number): number {
  if (total <= 0) return 1;
  return Math.ceil((rank / total) * 4);
}

function moscowToQuartile(moscow: FrameworkScores['moscow']): number {
  switch (moscow) {
    case 'Must': return 1;
    case 'Should': return 2;
    case 'Could': return 3;
    case "Won't": return 4;
  }
}

export function calculateConsensus(
  riceRank: number,
  iceRank: number,
  moscow: FrameworkScores['moscow'],
  total: number,
): ConsensusSignal {
  const riceQ = getQuartile(riceRank, total);
  const iceQ = getQuartile(iceRank, total);
  const moscowQ = moscowToQuartile(moscow);

  const riceTop = riceQ <= 2;
  const iceTop = iceQ <= 2;
  const riceBottom = riceQ > 2;
  const iceBottom = iceQ > 2;

  // Conflict conditions
  if ((riceTop && iceBottom) || (riceBottom && iceTop)) return 'Conflict';
  if (moscow === 'Must' && riceBottom && iceBottom) return 'Conflict';

  // Strong condition
  if (riceQ === iceQ && moscowQ === riceQ) return 'Strong';

  return 'Mixed';
}

const MOSCOW_WEIGHT: Record<string, number> = { Must: 100, Should: 75, Could: 40, "Won't": 10 };

export function calculateAllScores(features: Feature[]): Feature[] {
  // First pass: calculate raw scores
  const withScores = features.map((f) => ({
    ...f,
    scores: {
      ...f.scores,
      rice: calculateRICE(f.inputs),
      ice: calculateICE(f.inputs),
      moscow: calculateMoSCoW(f.inputs),
    },
  }));

  const total = withScores.length;

  // Rank by RICE (highest score = rank 1)
  const riceSorted = [...withScores].sort((a, b) => b.scores.rice - a.scores.rice);
  const riceRanks = new Map<string, number>();
  riceSorted.forEach((f, i) => riceRanks.set(f.id, i + 1));

  // Rank by ICE (highest score = rank 1)
  const iceSorted = [...withScores].sort((a, b) => b.scores.ice - a.scores.ice);
  const iceRanks = new Map<string, number>();
  iceSorted.forEach((f, i) => iceRanks.set(f.id, i + 1));

  // Second pass: assign ranks, consensus, and unified score
  const withRanks = withScores.map((f) => {
    const riceRank = riceRanks.get(f.id)!;
    const iceRank = iceRanks.get(f.id)!;
    const consensus = calculateConsensus(riceRank, iceRank, f.scores.moscow, total);

    // Unified score: average of RICE percentile, ICE percentile, and MoSCoW weight
    const ricePercentile = total <= 1 ? 100 : ((total - riceRank) / (total - 1)) * 100;
    const icePercentile = total <= 1 ? 100 : ((total - iceRank) / (total - 1)) * 100;
    const moscowWeight = MOSCOW_WEIGHT[f.scores.moscow] ?? 40;
    const unifiedScore = Math.round((ricePercentile + icePercentile + moscowWeight) / 3);

    console.log(`[unified] ${f.name}: riceRank=${riceRank}, iceRank=${iceRank}, moscowWeight=${moscowWeight}, unified=${unifiedScore}`);

    return {
      ...f,
      scores: {
        ...f.scores,
        riceRank,
        iceRank,
        unifiedScore,
      },
      consensus,
    };
  });

  // Rank by unified score (highest = rank 1)
  const unifiedSorted = [...withRanks].sort((a, b) => (b.scores.unifiedScore ?? 0) - (a.scores.unifiedScore ?? 0));
  const unifiedRanks = new Map<string, number>();
  unifiedSorted.forEach((f, i) => unifiedRanks.set(f.id, i + 1));

  return withRanks.map((f) => ({
    ...f,
    scores: { ...f.scores, unifiedRank: unifiedRanks.get(f.id)! },
  }));
}
