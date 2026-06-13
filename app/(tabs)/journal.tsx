import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { JournalForm } from '@/components/JournalForm';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useData } from '@/context/DataContext';
import { buildEmptyJournal } from '@/prediction/engine';
import { recoveryColor } from '@/theme/colors';
import type { JournalEntry } from '@/types/models';
import { prettyDate, todayKey } from '@/utils/date';

export default function JournalScreen() {
  const router = useRouter();
  const { todayJournal, saveTodayJournal, simulate } = useData();
  const [draft, setDraft] = useState<JournalEntry>(
    () => todayJournal ?? buildEmptyJournal(todayKey()),
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
    <Screen>
      <View className="mt-2 mb-4">
        <Text className="text-text text-2xl font-extrabold">Daily Journal</Text>
        <Text className="text-text-muted text-sm mt-0.5">
          {prettyDate(todayKey())}
        </Text>
      </View>

      <View className="bg-bg-card rounded-2xl border border-border-subtle p-4 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-text-muted text-xs uppercase tracking-wide">
            Live prediction · tomorrow
          </Text>
          <Text className="text-text-faint text-xs mt-1">
            Updates as you edit
          </Text>
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
    </Screen>
  );
}
