import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Field, Scale5, Segmented, Stepper, TimeField } from '@/components/form/Controls';
import { BackgroundScreen } from '@/components/ui/BackgroundScreen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useData } from '@/context/DataContext';
import { buildEmptyJournal } from '@/prediction/engine';
import { recoveryColor } from '@/theme/colors';
import { TRAINING_TYPES, type JournalEntry, type TrainingType } from '@/types/models';
import { todayKey } from '@/utils/date';
import { signed } from '@/utils/format';

const TRAINING = TRAINING_TYPES.filter((t) => t.value !== 'active_recovery');

export default function WhatIf() {
  const router = useRouter();
  const { todayJournal, simulate, saveTodayJournal } = useData();
  const base = todayJournal ?? buildEmptyJournal(todayKey());
  const [draft, setDraft] = useState<JournalEntry>(base);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof JournalEntry>(key: K, v: JournalEntry[K]) =>
    setDraft((d) => ({ ...d, [key]: v }));

  const baseScore = useMemo(
    () => simulate(base).prediction.predictedScore,
    [base, simulate],
  );
  const draftResult = useMemo(() => simulate(draft), [draft, simulate]);
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
    <BackgroundScreen image="coast">
      <View className="flex-row items-center justify-between mt-2 mb-4">
        <Text className="text-text text-2xl font-extrabold">What-If</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-accent font-semibold">Close</Text>
        </Pressable>
      </View>

      <Text className="text-text-muted text-sm mb-4">
        Adjust tonight’s biggest levers and watch tomorrow’s recovery move.
      </Text>

      <Card className="mb-5">
        <View className="flex-row items-center justify-around">
          <View className="items-center">
            <Text className="text-text-faint text-xs uppercase">Current</Text>
            <Text
              className="text-3xl font-extrabold mt-1"
              style={{ color: recoveryColor(baseScore) }}
            >
              {baseScore}
            </Text>
          </View>
          <Text className="text-text-faint text-2xl">→</Text>
          <View className="items-center">
            <Text className="text-text-faint text-xs uppercase">Simulated</Text>
            <Text
              className="text-3xl font-extrabold mt-1"
              style={{ color: recoveryColor(draftScore) }}
            >
              {draftScore}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-text-faint text-xs uppercase">Change</Text>
            <Text
              className="text-3xl font-extrabold mt-1"
              style={{
                color: delta > 0 ? '#34D399' : delta < 0 ? '#F87171' : '#9AA7B6',
              }}
            >
              {signed(delta)}
            </Text>
          </View>
        </View>
      </Card>

      <Card className="mb-4">
        <Field label="Alcohol" hint="Drinks tonight.">
          <Stepper
            value={draft.alcoholDrinks}
            onChange={(v) => set('alcoholDrinks', v)}
            min={0}
            max={20}
          />
        </Field>
      </Card>

      <Card className="mb-4">
        <Field label="Wind-down / lights out" hint="Earlier protects deep sleep.">
          <TimeField
            value={draft.winddownTime}
            onChange={(v) => set('winddownTime', v)}
          />
        </Field>
      </Card>

      <Card className="mb-4">
        <Field label="Training load">
          <Segmented
            options={TRAINING}
            value={draft.trainingType}
            onChange={(v: TrainingType) => set('trainingType', v)}
          />
        </Field>
        {draft.trainingType !== 'rest' && (
          <Field label="Intensity">
            <Scale5
              value={draft.trainingIntensity}
              onChange={(v) => set('trainingIntensity', v)}
              lowLabel="Easy"
              highLabel="Max"
            />
          </Field>
        )}
      </Card>

      <Button
        title={saving ? 'Saving…' : 'Save as today’s journal'}
        onPress={apply}
        loading={saving}
      />
      <View className="h-6" />
    </BackgroundScreen>
  );
}
