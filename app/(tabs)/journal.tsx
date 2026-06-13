import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { JournalForm } from '@/components/JournalForm';
import { BackgroundScreen } from '@/components/ui/BackgroundScreen';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import { buildEmptyJournal } from '@/prediction/engine';
import { recoveryColor } from '@/theme/colors';
import type { JournalEntry } from '@/types/models';
import { prettyDate, todayKey, yesterdayKey } from '@/utils/date';

/** Carry yesterday's high-signal answers forward as smart defaults. */
function reuse(prev: JournalEntry, date: string): JournalEntry {
  return {
    ...buildEmptyJournal(date),
    trainingType: prev.trainingType,
    trainingIntensity: prev.trainingIntensity,
    creatine: prev.creatine,
    supplements: prev.supplements,
    winddownTime: prev.winddownTime,
    energy: prev.energy,
    mood: prev.mood,
    workStress: prev.workStress,
    caffeineAfter2pm: prev.caffeineAfter2pm,
    waterLiters: prev.waterLiters,
  };
}

export default function JournalScreen() {
  const router = useRouter();
  const { todayJournal, journals, saveTodayJournal, simulate } = useData();

  const yesterdayJournal = useMemo(
    () => journals.find((j) => j.date === yesterdayKey()) ?? null,
    [journals],
  );

  const [draft, setDraft] = useState<JournalEntry>(
    () =>
      todayJournal ??
      (yesterdayJournal
        ? reuse(yesterdayJournal, todayKey())
        : buildEmptyJournal(todayKey())),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (todayJournal) setDraft(todayJournal);
  }, [todayJournal]);

  const preview = useMemo(() => simulate(draft), [draft, simulate]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveTodayJournal(draft);
      setSaved(true);
      setTimeout(() => router.push('/(tabs)'), 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BackgroundScreen image="forest">
      <View className="mt-2 mb-4 flex-row items-end justify-between">
        <View>
          <Text className="text-text text-2xl font-extrabold">Daily Journal</Text>
          <Text className="text-text-muted text-sm mt-0.5">
            {prettyDate(todayKey())}
          </Text>
        </View>
        {!todayJournal && yesterdayJournal && (
          <Pressable
            onPress={() => setDraft(reuse(yesterdayJournal, todayKey()))}
            className="rounded-lg border border-border bg-bg-input px-3 py-1.5 active:opacity-80"
          >
            <Text className="text-accent text-xs font-semibold">
              Same as yesterday
            </Text>
          </Pressable>
        )}
      </View>

      <View
        className="rounded-2xl border border-border-subtle p-4 mb-4 flex-row items-center justify-between"
        style={{ backgroundColor: 'rgba(18,24,33,0.74)' }}
      >
        <View>
          <Text className="text-text-muted text-xs uppercase tracking-wide">
            Live prediction · tomorrow
          </Text>
          <Text className="text-text-faint text-xs mt-1">Updates as you edit</Text>
        </View>
        <Text
          className="text-3xl font-extrabold"
          style={{ color: recoveryColor(preview.prediction.predictedScore) }}
        >
          {preview.prediction.predictedScore}
          <Text className="text-text-faint text-base font-normal">
            {' '}
            ±{preview.prediction.confidence}
          </Text>
        </Text>
      </View>

      <JournalForm value={draft} onChange={setDraft} />

      {error ? (
        <Text className="text-recovery-low text-sm mb-3">{error}</Text>
      ) : null}
      {saved ? (
        <Text className="text-recovery-high text-sm mb-3">
          Saved — prediction & actions updated.
        </Text>
      ) : null}

      <Button
        title={saving ? 'Saving…' : 'Save journal'}
        onPress={save}
        loading={saving}
      />
      <View className="h-6" />
    </BackgroundScreen>
  );
}
