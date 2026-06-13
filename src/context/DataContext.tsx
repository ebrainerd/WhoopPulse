import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { env } from '@/config/env';
import {
  buildEmptyJournal,
  runPrediction,
  type PredictionResult,
} from '@/prediction/engine';
import { getProfile } from '@/services/profile';
import { getJournalByDate, listJournals, saveJournal } from '@/services/journal';
import {
  listPredictions,
  listRecommendationLogs,
  logRecommendations,
  reconcilePredictionActuals,
  savePrediction,
  setRecommendationFollowed,
} from '@/services/predictions';
import { getTomorrowForecast, saveWeather } from '@/services/weather';
import { getWhoopConnection, listCycles, triggerWhoopSync } from '@/services/whoop';
import type {
  JournalEntry,
  Prediction,
  Profile,
  Recommendation,
  RecommendationLog,
  WeatherForecast,
  WhoopConnection,
  WhoopCycle,
} from '@/types/models';
import { todayKey, tomorrowKey } from '@/utils/date';

import { useAuth } from './AuthContext';

interface DataContextValue {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  profile: Profile | null;
  cycles: WhoopCycle[];
  journals: JournalEntry[];
  predictions: Prediction[];
  whoopConnection: WhoopConnection | null;
  todayJournal: JournalEntry | null;
  tomorrowWeather: WeatherForecast | null;
  /** Live prediction for tomorrow based on the latest data + today's journal. */
  livePrediction: PredictionResult | null;
  recommendationLogs: RecommendationLog[];
  refresh: () => Promise<void>;
  saveTodayJournal: (entry: JournalEntry) => Promise<void>;
  syncWhoop: () => Promise<void>;
  toggleRecommendation: (key: string, followed: boolean) => Promise<void>;
  /** What-if: run the engine on a draft without persisting. */
  simulate: (draft: JournalEntry) => PredictionResult;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cycles, setCycles] = useState<WhoopCycle[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [whoopConnection, setWhoopConnection] = useState<WhoopConnection | null>(null);
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null);
  const [tomorrowWeather, setTomorrowWeather] = useState<WeatherForecast | null>(null);
  const [recommendationLogs, setRecommendationLogs] = useState<RecommendationLog[]>([]);

  const loadAll = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!user) return;
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const [prof, cyc, jour, preds, conn, todayJ, recLogs] = await Promise.all([
          getProfile(user.id),
          listCycles(user.id),
          listJournals(user.id),
          listPredictions(user.id),
          getWhoopConnection(user.id),
          getJournalByDate(user.id, todayKey()),
          listRecommendationLogs(user.id, tomorrowKey()),
        ]);
        setProfile(prof);
        setCycles(cyc);
        setJournals(jour);
        setPredictions(preds);
        setWhoopConnection(conn);
        setTodayJournal(todayJ);
        setRecommendationLogs(recLogs);

        // Reconcile any past predictions whose actual recovery is now known.
        const recoveryByDate = new Map<string, number>();
        for (const c of cyc) {
          if (c.recoveryScore != null) recoveryByDate.set(c.date, c.recoveryScore);
        }
        const updated = await reconcilePredictionActuals(user.id, recoveryByDate);
        if (updated > 0) setPredictions(await listPredictions(user.id));

        // Weather forecast for tomorrow night (best-effort).
        const lat = prof?.locationLat ?? env.defaultLocation.lat;
        const lng = prof?.locationLng ?? env.defaultLocation.lng;
        try {
          const wx = await getTomorrowForecast(lat, lng);
          setTomorrowWeather(wx);
          if (wx) saveWeather(user.id, wx).catch(() => {});
        } catch {
          setTomorrowWeather(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (user) {
      loadAll('initial');
    } else {
      setLoading(false);
      setProfile(null);
      setCycles([]);
      setJournals([]);
      setPredictions([]);
      setTodayJournal(null);
    }
  }, [user, loadAll]);

  const buildInput = useCallback(
    (journal: JournalEntry) => ({
      date: tomorrowKey(),
      journal,
      recentCycles: cycles,
      yesterdayCycle: cycles.length > 0 ? cycles[cycles.length - 1] : null,
      weather: tomorrowWeather,
      pastPredictions: predictions,
      history: { journals, cycles },
    }),
    [cycles, tomorrowWeather, predictions, journals],
  );

  const livePrediction = useMemo<PredictionResult | null>(() => {
    if (!user) return null;
    const journal = todayJournal ?? buildEmptyJournal(todayKey());
    return runPrediction(buildInput(journal));
  }, [user, todayJournal, buildInput]);

  const simulate = useCallback(
    (draft: JournalEntry) => runPrediction(buildInput(draft)),
    [buildInput],
  );

  const saveTodayJournal = useCallback(
    async (entry: JournalEntry) => {
      if (!user) throw new Error('Not signed in');
      const saved = await saveJournal(user.id, entry);
      setTodayJournal(saved);
      setJournals((prev) => {
        const others = prev.filter((j) => j.date !== saved.date);
        return [...others, saved].sort((a, b) => a.date.localeCompare(b.date));
      });

      // Recompute and persist tomorrow's prediction + recommendations.
      const result = runPrediction(buildInput(saved));
      const savedPrediction = await savePrediction(user.id, result.prediction);
      setPredictions((prev) => {
        const others = prev.filter((p) => p.date !== savedPrediction.date);
        return [...others, savedPrediction].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
      });
      await logRecommendations(user.id, tomorrowKey(), result.recommendations);
      setRecommendationLogs(await listRecommendationLogs(user.id, tomorrowKey()));
    },
    [user, buildInput],
  );

  const syncWhoop = useCallback(async () => {
    if (!user) return;
    await triggerWhoopSync();
    await loadAll('refresh');
  }, [user, loadAll]);

  const toggleRecommendation = useCallback(
    async (key: string, followed: boolean) => {
      if (!user) return;
      await setRecommendationFollowed(user.id, tomorrowKey(), key, followed);
      setRecommendationLogs((prev) =>
        prev.map((r) => (r.actionKey === key ? { ...r, followed } : r)),
      );
    },
    [user],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      refreshing,
      error,
      profile,
      cycles,
      journals,
      predictions,
      whoopConnection,
      todayJournal,
      tomorrowWeather,
      livePrediction,
      recommendationLogs,
      refresh: () => loadAll('refresh'),
      saveTodayJournal,
      syncWhoop,
      toggleRecommendation,
      simulate,
    }),
    [
      loading,
      refreshing,
      error,
      profile,
      cycles,
      journals,
      predictions,
      whoopConnection,
      todayJournal,
      tomorrowWeather,
      livePrediction,
      recommendationLogs,
      loadAll,
      saveTodayJournal,
      syncWhoop,
      toggleRecommendation,
      simulate,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
