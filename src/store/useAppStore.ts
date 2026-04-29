import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Release, Feature, ScoringInputs, AppStore } from '../types';
import {
  calculateRICE,
  calculateICE,
  calculateMoSCoW,
  calculateAllScores,
} from '../lib/scoring';
import { showToast } from './useToastStore';

interface AppActions {
  createRelease(data: Partial<Release>): void;
  updateRelease(id: string, data: Partial<Release>): void;
  deleteRelease(id: string): void;
  setActiveRelease(id: string | null): void;
  setActiveTab(tab: AppStore['activeTab']): void;
  addFeature(releaseId: string, inputs: ScoringInputs, name: string): void;
  updateFeature(releaseId: string, featureId: string, data: Partial<Pick<Feature, 'name' | 'inputs'>>): void;
  deleteFeature(releaseId: string, featureId: string): void;
  duplicateFeature(releaseId: string, featureId: string): void;
  reorderFeatures(releaseId: string, fromIndex: number, toIndex: number): void;
  finalizeRelease(id: string): void;
  importRelease(data: unknown): void;
}

type StoreState = AppStore & AppActions;

function recalcRelease(release: Release): Release {
  const updated = calculateAllScores(release.features);
  return { ...release, features: updated, dateModified: new Date().toISOString() };
}

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      releases: [],
      activeReleaseId: undefined,
      activeTab: 'dashboard',

      createRelease(data) {
        const now = new Date().toISOString();
        const release: Release = {
          id: crypto.randomUUID(),
          name: data.name || 'Untitled Release',
          status: data.status || 'Draft',
          features: data.features || [],
          dateCreated: now,
          dateModified: now,
          ...(data.targetDate && { targetDate: data.targetDate }),
          ...(data.capacity != null && { capacity: data.capacity }),
          ...(data.description && { description: data.description }),
        };
        set((state) => ({
          releases: [...state.releases, release],
          activeReleaseId: release.id,
        }));
      },

      updateRelease(id, data) {
        set((state) => ({
          releases: state.releases.map((r) =>
            r.id === id
              ? { ...r, ...data, id, dateModified: new Date().toISOString() }
              : r,
          ),
        }));
      },

      deleteRelease(id) {
        set((state) => ({
          releases: state.releases.filter((r) => r.id !== id),
          activeReleaseId: state.activeReleaseId === id ? undefined : state.activeReleaseId,
        }));
      },

      setActiveRelease(id) {
        set({ activeReleaseId: id ?? undefined });
      },

      setActiveTab(tab) {
        set({ activeTab: tab });
      },

      addFeature(releaseId, inputs, name) {
        set((state) => ({
          releases: state.releases.map((r) => {
            if (r.id !== releaseId) return r;
            const now = new Date().toISOString();
            const feature: Feature = {
              id: crypto.randomUUID(),
              name,
              inputs,
              scores: {
                rice: calculateRICE(inputs),
                ice: calculateICE(inputs),
                moscow: calculateMoSCoW(inputs),
              },
              consensus: 'Mixed',
              sortOrder: r.features.length,
              dateAdded: now,
              dateModified: now,
            };
            return recalcRelease({ ...r, features: [...r.features, feature] });
          }),
        }));
      },

      updateFeature(releaseId, featureId, data) {
        set((state) => ({
          releases: state.releases.map((r) => {
            if (r.id !== releaseId) return r;
            const features = r.features.map((f) => {
              if (f.id !== featureId) return f;
              const inputs = data.inputs ?? f.inputs;
              return {
                ...f,
                ...(data.name != null && { name: data.name }),
                inputs,
                scores: {
                  ...f.scores,
                  rice: calculateRICE(inputs),
                  ice: calculateICE(inputs),
                  moscow: calculateMoSCoW(inputs),
                },
                dateModified: new Date().toISOString(),
              };
            });
            return recalcRelease({ ...r, features });
          }),
        }));
      },

      deleteFeature(releaseId, featureId) {
        set((state) => ({
          releases: state.releases.map((r) => {
            if (r.id !== releaseId) return r;
            const features = r.features.filter((f) => f.id !== featureId);
            return recalcRelease({ ...r, features });
          }),
        }));
      },

      duplicateFeature(releaseId, featureId) {
        set((state) => ({
          releases: state.releases.map((r) => {
            if (r.id !== releaseId) return r;
            const source = r.features.find((f) => f.id === featureId);
            if (!source) return r;
            const now = new Date().toISOString();
            const duplicate: Feature = {
              ...source,
              id: crypto.randomUUID(),
              name: `${source.name} (copy)`,
              sortOrder: r.features.length,
              dateAdded: now,
              dateModified: now,
            };
            return recalcRelease({ ...r, features: [...r.features, duplicate] });
          }),
        }));
      },

      reorderFeatures(releaseId, fromIndex, toIndex) {
        set((state) => ({
          releases: state.releases.map((r) => {
            if (r.id !== releaseId) return r;
            const features = [...r.features];
            const [moved] = features.splice(fromIndex, 1);
            features.splice(toIndex, 0, moved);
            return {
              ...r,
              features: features.map((f, i) => ({ ...f, sortOrder: i })),
              dateModified: new Date().toISOString(),
            };
          }),
        }));
      },

      finalizeRelease(id) {
        set((state) => ({
          releases: state.releases.map((r) =>
            r.id === id
              ? { ...r, status: 'Finalized' as const, dateModified: new Date().toISOString() }
              : r,
          ),
        }));
      },

      importRelease(data) {
        const parsed = data as Partial<Release>;
        if (!parsed || typeof parsed !== 'object' || !parsed.name) {
          showToast('Import failed: file is not valid PrioritizeHQ data.', 'error');
          return;
        }
        const now = new Date().toISOString();
        const release: Release = {
          id: crypto.randomUUID(),
          name: parsed.name,
          status: parsed.status || 'Draft',
          features: Array.isArray(parsed.features) ? parsed.features : [],
          dateCreated: now,
          dateModified: now,
          ...(parsed.targetDate && { targetDate: parsed.targetDate }),
          ...(parsed.capacity != null && { capacity: parsed.capacity }),
          ...(parsed.description && { description: parsed.description }),
        };
        const recalculated = recalcRelease(release);
        set((state) => ({
          releases: [...state.releases, recalculated],
          activeReleaseId: recalculated.id,
        }));
      },
    }),
    {
      name: 'prioritize-hq-v1',
      onRehydrateStorage: () => (state) => {
        // Recalculate all scores on hydration so features persisted before
        // new scoring fields (e.g. unifiedScore) get updated values.
        if (state && state.releases.length > 0) {
          state.releases = state.releases.map((r) => recalcRelease(r));
        }
      },
      storage: {
        getItem(name) {
          try {
            const value = localStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch {
            showToast("Data couldn't be loaded.", 'error');
            return null;
          }
        },
        setItem(name, value) {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {
            showToast("Couldn't save. Storage may be full.", 'error');
          }
        },
        removeItem(name) {
          try {
            localStorage.removeItem(name);
          } catch {
            // Silently fail
          }
        },
      },
    },
  ),
);
