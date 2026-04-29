import { useAppStore } from '../store/useAppStore';
import { calculateAllScores } from '../lib/scoring';
import type { Feature, ScoringInputs, Release } from '../types';

function feat(name: string, inputs: ScoringInputs, order: number): Feature {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    inputs,
    scores: { rice: 0, ice: 0, moscow: 'Could' },
    consensus: 'Mixed',
    sortOrder: order,
    dateAdded: now,
    dateModified: now,
  };
}

export function seedTestData() {
  const state = useAppStore.getState();
  if (state.releases.length > 0) return; // already has data

  const now = new Date().toISOString();

  /* ═══ Release 1: Q3 2026 Launch (Draft, 8 features, capacity 5) ═══ */
  const r1Features: Feature[] = [
    feat('AI-powered search', { customerScope: 'all', valueDelivered: 'transformative', confidenceLevel: 'validated', buildComplexity: 'L', strategicNecessity: 'differentiator' }, 0),
    feat('SSO / SAML integration', { customerScope: 'enterprise', valueDelivered: 'significant', confidenceLevel: 'validated', buildComplexity: 'M', strategicNecessity: 'commitment' }, 1),
    feat('Bulk CSV import', { customerScope: 'all', valueDelivered: 'moderate', confidenceLevel: 'strong_hunch', buildComplexity: 'S', strategicNecessity: 'user_requested' }, 2),
    feat('Dark mode', { customerScope: 'all', valueDelivered: 'minor', confidenceLevel: 'guess', buildComplexity: 'M', strategicNecessity: 'user_requested' }, 3),
    feat('Real-time collaboration', { customerScope: 'enterprise', valueDelivered: 'transformative', confidenceLevel: 'speculative', buildComplexity: 'XXL', strategicNecessity: 'speculative_bet' }, 4),
    feat('Export to Jira', { customerScope: 'enterprise', valueDelivered: 'significant', confidenceLevel: 'strong_hunch', buildComplexity: 'M', strategicNecessity: 'competitive' }, 5),
    feat('Custom scoring weights', { customerScope: 'committed', valueDelivered: 'moderate', confidenceLevel: 'guess', buildComplexity: 'L', strategicNecessity: 'differentiator' }, 6),
    feat('Notification digest email', { customerScope: 'all', valueDelivered: 'negligible', confidenceLevel: 'speculative', buildComplexity: 'S', strategicNecessity: 'internal' }, 7),
  ];

  const r1: Release = {
    id: crypto.randomUUID(),
    name: 'Q3 2026 Launch',
    targetDate: '2026-09-30',
    capacity: 5,
    description: 'Major product update with AI features, enterprise SSO, and quality-of-life improvements requested by customers.',
    status: 'Draft',
    features: calculateAllScores(r1Features),
    dateCreated: now,
    dateModified: now,
  };

  /* ═══ Release 2: Mobile App v2 (In Review, 6 features, capacity 4) ═══ */
  const r2Features: Feature[] = [
    feat('Offline mode', { customerScope: 'all', valueDelivered: 'significant', confidenceLevel: 'strong_hunch', buildComplexity: 'XL', strategicNecessity: 'competitive' }, 0),
    feat('Push notifications', { customerScope: 'all', valueDelivered: 'moderate', confidenceLevel: 'validated', buildComplexity: 'M', strategicNecessity: 'commitment' }, 1),
    feat('Biometric login', { customerScope: 'all', valueDelivered: 'moderate', confidenceLevel: 'validated', buildComplexity: 'S', strategicNecessity: 'competitive' }, 2),
    feat('Widget for home screen', { customerScope: 'committed', valueDelivered: 'minor', confidenceLevel: 'guess', buildComplexity: 'M', strategicNecessity: 'user_requested' }, 3),
    feat('In-app feedback form', { customerScope: 'all', valueDelivered: 'negligible', confidenceLevel: 'strong_hunch', buildComplexity: 'S', strategicNecessity: 'internal' }, 4),
    feat('Gesture navigation', { customerScope: 'all', valueDelivered: 'significant', confidenceLevel: 'speculative', buildComplexity: 'L', strategicNecessity: 'differentiator' }, 5),
  ];

  const r2: Release = {
    id: crypto.randomUUID(),
    name: 'Mobile App v2',
    targetDate: '2026-07-15',
    capacity: 4,
    description: 'Second major release of the mobile app focused on offline capabilities and native platform polish.',
    status: 'In Review',
    features: calculateAllScores(r2Features),
    dateCreated: new Date(Date.now() - 7 * 86400000).toISOString(),
    dateModified: new Date(Date.now() - 86400000).toISOString(),
  };

  /* ═══ Release 3: Internal Tools (Finalized, 4 features, no capacity) ═══ */
  const r3Features: Feature[] = [
    feat('Admin audit log', { customerScope: 'internal', valueDelivered: 'significant', confidenceLevel: 'validated', buildComplexity: 'M', strategicNecessity: 'commitment' }, 0),
    feat('Metrics dashboard', { customerScope: 'internal', valueDelivered: 'moderate', confidenceLevel: 'strong_hunch', buildComplexity: 'L', strategicNecessity: 'internal' }, 1),
    feat('Feature flag system', { customerScope: 'internal', valueDelivered: 'transformative', confidenceLevel: 'validated', buildComplexity: 'M', strategicNecessity: 'differentiator' }, 2),
    feat('Automated deploy pipeline', { customerScope: 'internal', valueDelivered: 'significant', confidenceLevel: 'validated', buildComplexity: 'XL', strategicNecessity: 'internal' }, 3),
  ];

  const r3: Release = {
    id: crypto.randomUUID(),
    name: 'Internal Tools Sprint',
    targetDate: '2026-04-01',
    description: 'Engineering productivity sprint — completed and deployed.',
    status: 'Finalized',
    features: calculateAllScores(r3Features),
    dateCreated: new Date(Date.now() - 30 * 86400000).toISOString(),
    dateModified: new Date(Date.now() - 14 * 86400000).toISOString(),
  };

  useAppStore.setState({
    releases: [r1, r2, r3],
    activeReleaseId: r1.id,
  });
}
