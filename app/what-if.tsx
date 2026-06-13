import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { JournalForm } from '@/components/JournalForm';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useData } from '@/context/DataContext';
import { buildEmptyJournal } from '@/prediction/engine';
import { recoveryColor } from '@/theme/colors';
import type { JournalEntry } from '@/types/models';
import { signed } from '@/utils/format';
import { todayKey } from '@/utils/date';

export default function WhatIf() {
  const router = useRouter();
  const { todayJournal, simulate, saveTodayJournal } = useData();
  const base = todayJournal ?? buildEmptyJournal(todayKey());
  const [draft, setDraft] = useState<JournalEntry>(base);
  const [saving, setSaving] = useState(false);

  const baseResult = useMemo(() => simulate(base), [base, simulate]);
  const draftResult = useMemo(() => simulate(draft), [draft, simulate]);

  const baseScore = baseResult.prediction.predictedScore;
  const draftScore = draftResult.prediction.predictedScore;
  const delta = draftScore - baseScore;

  const apply = async () => {
    setSaving(true);
    try {
      await saveTodayJournal(draft);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between mt-2 mb-4">
        <Text className="text-text text-2xl font-extrabold">What-If</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-accent font-semibold">Close</Text>
        </Pressable>
      </View>

      <Text className="text-text-muted text-sm mb-4">
        Tweak tonight’s inputs to preview the impact on tomorrow’s recovery.
      </Text>

      <View className="bg-bg-card rounded-2xl border border-border-subtle p-4 mb-5 flex-row items-center justify-around">
        <View className="items-center">
          <Text className="text-text-faint text-xs uppercase">Current</Text>
          <Text
            className="text-2xl font-extrabold mt-1"
            style={{ color: recoveryColor(baseScore) }}
          >
            {baseScore}
          </Text>
        </View>
        <Text className="text-text-faint text-2xl">→</Text>
        <View className="items-center">
          <Text className="text-text-faint text-xs uppercase">Simulated</Text>
          <Text
            className="text-2xl font-extrabold mt-1"
            style={{ color: recoveryColor(draftScore) }}
          >
            {draftScore}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-text-faint text-xs uppercase">Change</Text>
          <Text
            className="text-2xl font-extrabold mt-1"
            style={{
              color: delta > 0 ? '#34D399' : delta < 0 ? '#F87171' : '#9AA7B6',
            }}
          >
            {signed(delta)}
          </Text>
        </View>
      </View>

      <JournalForm value={draft} onChange={setDraft} />

      <Button
        title={saving ? 'Saving…' : 'Save these as today’s journal'}
        onPress={apply}
        loading={saving}
      />
      <View className="h-6" />
    </Screen>
  );
}
