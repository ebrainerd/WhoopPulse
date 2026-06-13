import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Segmented } from '@/components/form/Controls';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, SectionHeader } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { analyzeExperiment } from '@/experiments/analysis';
import { EXPERIMENT_CONDITIONS, getCondition } from '@/experiments/conditions';
import {
  abandonExperiment,
  completeExperiment,
  createExperiment,
  listExperiments,
} from '@/services/experiments';
import { colors } from '@/theme/colors';
import type { Experiment } from '@/types/models';
import { todayKey } from '@/utils/date';

const DURATIONS = [7, 14, 21, 30];

export default function Experiments() {
  const router = useRouter();
  const { user } = useAuth();
  const { journals, cycles } = useData();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [creating, setCreating] = useState(false);
  const [conditionKey, setConditionKey] = useState(EXPERIMENT_CONDITIONS[0].key);
  const [targetDays, setTargetDays] = useState(14);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setExperiments(await listExperiments(user.id));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const active = experiments.filter((e) => e.status === 'active');
  const done = experiments.filter((e) => e.status !== 'active');

  const create = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const cond = getCondition(conditionKey)!;
      await createExperiment(user.id, {
        title: cond.title,
        hypothesis: cond.hypothesis,
        conditionKey,
        startDate: todayKey(),
        endDate: null,
        targetDays,
        status: 'active',
        resultSummary: null,
      });
      setCreating(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between mt-2 mb-4">
        <Text className="text-text text-2xl font-extrabold">Experiments</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-accent font-semibold">Done</Text>
        </Pressable>
      </View>

      <Text className="text-text-muted text-sm mb-4">
        Run a structured n-of-1 self-test: hold one behavior steady and let the
        app measure its effect on your recovery vs your baseline.
      </Text>

      {creating ? (
        <Card className="mb-4">
          <CardTitle>New experiment</CardTitle>
          <Text className="text-text font-semibold mb-2">Protocol</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {EXPERIMENT_CONDITIONS.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => setConditionKey(c.key)}
                className={`px-3 py-2 rounded-xl border ${
                  conditionKey === c.key
                    ? 'bg-accent border-accent'
                    : 'bg-bg-input border-border'
                }`}
              >
                <Text
                  className={`text-sm ${
                    conditionKey === c.key ? 'text-bg font-semibold' : 'text-text-muted'
                  }`}
                >
                  {c.title}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className="text-text-muted text-sm mb-3">
            {getCondition(conditionKey)?.hypothesis}
          </Text>
          <Text className="text-text font-semibold mb-2">Duration</Text>
          <View className="mb-4">
            <Segmented
              options={DURATIONS.map((d) => ({ label: `${d} days`, value: d }))}
              value={targetDays}
              onChange={setTargetDays}
            />
          </View>
          <View className="gap-2">
            <Button title="Start experiment" onPress={create} loading={busy} />
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setCreating(false)}
            />
          </View>
        </Card>
      ) : (
        <View className="mb-4">
          <Button title="+ New experiment" onPress={() => setCreating(true)} />
        </View>
      )}

      {active.length > 0 && <SectionHeader title="Active" />}
      {active.map((exp) => (
        <ExperimentCard
          key={exp.id}
          exp={exp}
          journals={journals}
          cycles={cycles}
          onComplete={async () => {
            if (!user || !exp.id) return;
            const r = analyzeExperiment(exp, journals, cycles);
            await completeExperiment(user.id, exp.id, todayKey(), r.verdict);
            await load();
          }}
          onAbandon={async () => {
            if (!user || !exp.id) return;
            await abandonExperiment(user.id, exp.id);
            await load();
          }}
        />
      ))}

      {done.length > 0 && <SectionHeader title="Completed" />}
      {done.map((exp) => (
        <Card key={exp.id} className="mb-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-text font-bold">{exp.title}</Text>
            <Text className="text-text-faint text-xs uppercase">{exp.status}</Text>
          </View>
          {exp.resultSummary ? (
            <Text className="text-text-muted text-sm mt-1">{exp.resultSummary}</Text>
          ) : null}
        </Card>
      ))}
      <View className="h-4" />
    </Screen>
  );
}

function ExperimentCard({
  exp,
  journals,
  cycles,
  onComplete,
  onAbandon,
}: {
  exp: Experiment;
  journals: Parameters<typeof analyzeExperiment>[1];
  cycles: Parameters<typeof analyzeExperiment>[2];
  onComplete: () => void;
  onAbandon: () => void;
}) {
  const result = useMemo(
    () => analyzeExperiment(exp, journals, cycles),
    [exp, journals, cycles],
  );
  const deltaColor =
    result.delta == null
      ? colors.textMuted
      : result.delta >= 3
        ? colors.recoveryHigh
        : result.delta <= -3
          ? colors.recoveryLow
          : colors.recoveryMid;

  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-text font-bold">{exp.title}</Text>
        <Text className="text-text-faint text-xs">
          Day {Math.min(result.daysElapsed, result.totalWindowDays)}/
          {result.totalWindowDays}
        </Text>
      </View>
      <Text className="text-text-muted text-xs mb-3">{exp.hypothesis}</Text>

      <View className="flex-row justify-between mb-3">
        <Stat label="Adherence" value={`${result.adherencePct}%`} />
        <Stat
          label="On protocol"
          value={result.onProtocolRecovery != null ? `${result.onProtocolRecovery}` : '—'}
        />
        <Stat
          label="Baseline"
          value={result.baselineRecovery != null ? `${result.baselineRecovery}` : '—'}
        />
        <Stat
          label="Δ"
          value={
            result.delta != null
              ? `${result.delta > 0 ? '+' : ''}${result.delta}`
              : '—'
          }
          color={deltaColor}
        />
      </View>

      <Text className="text-sm font-semibold mb-3" style={{ color: deltaColor }}>
        {result.verdict}
      </Text>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button title="Finish" variant="secondary" onPress={onComplete} />
        </View>
        <View className="flex-1">
          <Button title="Abandon" variant="ghost" onPress={onAbandon} />
        </View>
      </View>
    </Card>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View>
      <Text className="text-text-faint text-[11px] uppercase tracking-wide">
        {label}
      </Text>
      <Text
        className="text-text text-lg font-bold mt-0.5"
        style={color ? { color } : undefined}
      >
        {value}
      </Text>
    </View>
  );
}
