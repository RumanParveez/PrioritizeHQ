export interface ScoringInputs {
  customerScope: 'all' | 'enterprise' | 'committed' | 'internal';
  estimatedUsers?: number;
  valueDelivered: 'transformative' | 'significant' | 'moderate' | 'minor' | 'negligible';
  confidenceLevel: 'validated' | 'strong_hunch' | 'guess' | 'speculative';
  buildComplexity: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  strategicNecessity: 'commitment' | 'competitive' | 'differentiator' | 'user_requested' | 'speculative_bet' | 'internal';
}

export interface FrameworkScores {
  rice: number;
  ice: number;
  moscow: 'Must' | 'Should' | 'Could' | "Won't";
  riceRank?: number;
  iceRank?: number;
  unifiedScore?: number;
  unifiedRank?: number;
}

export type ConsensusSignal = 'Strong' | 'Mixed' | 'Conflict';

export interface Feature {
  id: string;
  name: string;
  inputs: ScoringInputs;
  scores: FrameworkScores;
  consensus: ConsensusSignal;
  sortOrder: number;
  dateAdded: string;
  dateModified: string;
}

export interface Release {
  id: string;
  name: string;
  targetDate?: string;
  capacity?: number;
  description?: string;
  status: 'Draft' | 'In Review' | 'Finalized';
  features: Feature[];
  dateCreated: string;
  dateModified: string;
}

export interface AppStore {
  releases: Release[];
  activeReleaseId?: string;
  activeTab: 'dashboard' | 'rankings' | 'add-edit' | 'reports';
}
