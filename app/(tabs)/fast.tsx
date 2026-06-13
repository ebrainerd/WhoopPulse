import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Segmented } from '@/components/form/Controls';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, SectionHeader } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import {
  FAST_STAGES,
  FAST_TARGET_OPTIONS,
  computeFastProgress,
  formatDuration,
} from '@/fasting/stages';
import { endFast, getActiveFast, listFasts, startFast } from '@/services/fasts';
import { colors } from '@/theme/colors';
import type { Fast } from '@/types/models';
import { prettyDate } from '@/utils/date';

export default function FastScreen() {
  const { user } = useAuth();
  const [active, setActive] = useState<Fast | null>(null);
  const [history, setHistory] = useState<Fast[]>([]);
  const [target, setTarget] = useState(16);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [a, h] = await Promise.all([
        getActiveFast(user.id),
        listFasts(user.id),
      ]);
      setActive(a);
      setHistory(h.filter((f) => f.endAt != null));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Tick every second while a fast is active to drive the live timer.
  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  const begin = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const f = await startFast(user.id, target);
      setActive(f);
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    if (!user || !active?.id) return;
    setBusy(true);
    try {
      await endFast(user.id, active.id);
      setActive(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View className="mt-2 mb-2">
        <Text className="text-text text-2xl font-extrabold">Fasting</Text>
      </View>

      {active ? (
        <ActiveFast fast={active} onStop={stop} busy={busy} />
      ) : (
        <Card>
          <CardTitle>Start a fast</CardTitle>
          <Text className="text-text-muted text-sm mb-3">
            Pick a target window. We’ll track your time and the metabolic stages
            your body moves through.
          </Text>
          <View className="mb-4">
            <Segmented
              options={FAST_TARGET_OPTIONS.map((h) => ({
                label: `${h}h`,
                value: h,
              }))}
              value={target}
              onChange={setTarget}
            />
          </View>
          <Button title="Start fast" onPress={begin} loading={busy} />
        </Card>
      )}

      <SectionHeader title="Stages" />
      <Card>
        {FAST_STAGES.map((s, i) => (
          <View
            key={s.name}
            className={`flex-row py-2 ${i > 0 ? 'border-t border-border-subtle' : ''}`}
          >
            <View
              className="w-1.5 rounded-full mr-3"
              style={{ backgroundColor: s.color }}
            />
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-text font-semibold">{s.name}</Text>
                <Text className="text-text-faint text-xs">{s.startHour}h+</Text>
              </View>
              <Text className="text-text-muted text-xs mt-0.5">
                {s.description}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {history.length > 0 && (
        <>
          <SectionHeader title="History" />
          <Card>
            {history.slice(0, 14).map((f, i) => {
              const ms =
                f.endAt != null
                  ? new Date(f.endAt).getTime() - new Date(f.startAt).getTime()
                  : 0;
              const hrs = ms / 3_600_000;
              const hit = hrs >= f.targetHours;
              return (
                <View
                  key={f.id}
                  className={`flex-row items-center justify-between py-2 ${
                    i > 0 ? 'border-t border-border-subtle' : ''
                  }`}
                >
                  <Text className="text-text-muted text-sm">
                    {prettyDate(f.startAt.slice(0, 10))}
                  </Text>
                  <Text
                    className="font-bold"
                    style={{ color: hit ? colors.recoveryHigh : colors.recoveryMid }}
                  >
                    {hrs.toFixed(1)}h / {f.targetHours}h
                  </Text>
                </View>
              );
            })}
          </Card>
        </>
      )}
      <View className="h-4" />
    </Screen>
  );
}

function ActiveFast({
  fast,
  onStop,
  busy,
}: {
  fast: Fast;
  onStop: () => void;
  busy: boolean;
}) {
  const progress = computeFastProgress(fast.startAt, fast.targetHours);
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;

  return (
    <Card>
      <View className="items-center py-2">
        <View style={{ width: size, height: size }} className="items-center justify-center">
          <Svg width={size} height={size} style={{ position: 'absolute' }}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.bgInput}
              strokeWidth={stroke}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={progress.current.color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - progress.targetPct)}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <Text className="text-text text-4xl font-extrabold">
            {formatDuration(
              new Date().getTime() - new Date(fast.startAt).getTime(),
            )}
          </Text>
          <Text className="text-text-muted text-sm mt-1">
            of {fast.targetHours}h target
          </Text>
          {progress.reachedTarget && (
            <Text className="text-recovery-high text-xs font-bold mt-1">
              Target reached
            </Text>
          )}
        </View>

        <View
          className="mt-4 w-full rounded-xl p-3"
          style={{ backgroundColor: `${progress.current.color}1A` }}
        >
          <Text
            className="font-bold text-base"
            style={{ color: progress.current.color }}
          >
            {progress.current.name}
          </Text>
          <Text className="text-text-muted text-sm mt-1">
            {progress.current.description}
          </Text>
          {progress.next && progress.hoursToNext != null && (
            <Text className="text-text-faint text-xs mt-2">
              Next: {progress.next.name} in {progress.hoursToNext}h
            </Text>
          )}
        </View>

        <View className="mt-4 w-full">
          <Button title="End fast" variant="secondary" onPress={onStop} loading={busy} />
        </View>
      </View>
    </Card>
  );
}
