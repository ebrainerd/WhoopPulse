import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card, CardTitle, SectionHeader } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import { analyzePanel } from '@/bloodwork/analysis';
import { BLOODWORK_DISCLAIMER, MARKERS } from '@/bloodwork/markers';
import { listBloodworkPanels, saveBloodworkPanel } from '@/services/bloodwork';
import { colors } from '@/theme/colors';
import type { BloodworkPanel } from '@/types/models';
import { prettyDate, todayKey } from '@/utils/date';

const CATEGORIES = Array.from(new Set(MARKERS.map((m) => m.category))); 

export default function Bloodwork() {
  const router = useRouter();
  const { user } = useAuth();
  const [panels, setPanels] = useState<BloodworkPanel[]>([]);
  const [adding, setAdding] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const list = await listBloodworkPanels(user.id);
    setPanels(list);
    if (list.length > 0 && !selectedId) setSelectedId(list[0].id ?? null);
  }, [user, selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected =
    panels.find((p) => p.id === selectedId) ?? panels[0] ?? null;
  const analysis = useMemo(
    () => (selected ? analyzePanel(selected) : null),
    [selected],
  );

  const save = async () => {
    if (!user) return;
    const markers: Record<string, number> = {};
    for (const [k, v] of Object.entries(values)) {
      const n = parseFloat(v);
      if (!Number.isNaN(n)) markers[k] = n;
    }
    if (Object.keys(markers).length === 0) {
      setAdding(false);
      return;
    }
    setBusy(true);
    try {
      const saved = await saveBloodworkPanel(user.id, {
        date: todayKey(),
        markers,
        notes: '',
      });
      setValues({});
      setAdding(false);
      setSelectedId(saved.id ?? null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between mt-2 mb-3">
        <Text className="text-text text-2xl font-extrabold">Bloodwork</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-accent font-semibold">Done</Text>
        </Pressable>
      </View>

      <Text className="text-text-faint text-xs mb-4">{BLOODWORK_DISCLAIMER}</Text>

      {adding ? (
        <View>
          <Text className="text-text-muted text-sm mb-3">
            Enter the values you have — leave the rest blank.
          </Text>
          {CATEGORIES.map((cat) => (
            <Card key={cat} className="mb-3">
              <CardTitle>{cat}</CardTitle>
              {MARKERS.filter((m) => m.category === cat).map((m) => (
                <View
                  key={m.key}
                  className="flex-row items-center justify-between py-1.5"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-text text-sm">{m.label}</Text>
                    <Text className="text-text-faint text-[11px]">
                      {m.optimalLow != null && m.optimalHigh != null
                        ? `optimal ${m.optimalLow}–${m.optimalHigh}`
                        : m.optimalHigh != null
                          ? `optimal < ${m.optimalHigh}`
                          : m.optimalLow != null
                            ? `optimal > ${m.optimalLow}`
                            : ''}{' '}
                      {m.unit}
                    </Text>
                  </View>
                  <TextInput
                    value={values[m.key] ?? ''}
                    onChangeText={(t) =>
                      setValues((prev) => ({ ...prev, [m.key]: t }))
                    }
                    keyboardType="decimal-pad"
                    placeholder="—"
                    placeholderTextColor={colors.textFaint}
                    className="bg-bg-input border border-border rounded-lg px-3 py-2 text-text w-24 text-right"
                  />
                </View>
              ))}
            </Card>
          ))}
          <View className="gap-2 mb-4">
            <Button title="Save panel" onPress={save} loading={busy} />
            <Button title="Cancel" variant="ghost" onPress={() => setAdding(false)} />
          </View>
        </View>
      ) : (
        <View className="mb-4">
          <Button title="+ Add bloodwork panel" onPress={() => setAdding(true)} />
        </View>
      )}

      {!adding && panels.length > 1 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {panels.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setSelectedId(p.id ?? null)}
              className={`px-3 py-1.5 rounded-lg border ${
                selected?.id === p.id
                  ? 'bg-accent border-accent'
                  : 'bg-bg-input border-border'
              }`}
            >
              <Text
                className={`text-xs ${
                  selected?.id === p.id ? 'text-bg font-semibold' : 'text-text-muted'
                }`}
              >
                {prettyDate(p.date)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {!adding && analysis && selected && (
        <>
          <SectionHeader title={`Results · ${prettyDate(selected.date)}`} />
          <Card className="mb-4">
            <Text className="text-text-muted text-sm">
              {analysis.optimalCount}/{analysis.totalCount} markers in optimal
              range
              {analysis.flagged.length > 0
                ? ` · ${analysis.flagged.length} to address`
                : ' · all good 🎯'}
            </Text>
          </Card>

          {analysis.findings.map((f) => (
            <Card key={f.key} className="mb-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-text font-bold">{f.label}</Text>
                <View className="flex-row items-center">
                  <Text className="text-text font-bold mr-2">
                    {f.value} {f.unit}
                  </Text>
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: `${f.statusColor}22` }}
                  >
                    <Text
                      className="text-[11px] font-bold uppercase"
                      style={{ color: f.statusColor }}
                    >
                      {f.status}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-text-faint text-xs mt-0.5">
                optimal {f.optimalRange}
              </Text>
              {f.summary ? (
                <Text className="text-text-muted text-sm mt-2">{f.summary}</Text>
              ) : null}
              {f.suggestions.map((s, i) => (
                <View key={i} className="flex-row mt-1.5">
                  <Text className="text-accent text-xs font-semibold w-24">
                    {s.type}
                  </Text>
                  <Text className="text-text-muted text-sm flex-1">{s.text}</Text>
                </View>
              ))}
            </Card>
          ))}

          {analysis.groupedSuggestions.length > 0 && (
            <>
              <SectionHeader title="Action plan" />
              <Card className="mb-4">
                {analysis.groupedSuggestions.map((g) => (
                  <View key={g.type} className="mb-3">
                    <Text className="text-text font-semibold mb-1">{g.type}</Text>
                    {g.items.map((it, i) => (
                      <View key={i} className="flex-row py-0.5">
                        <Text className="text-accent mr-2">•</Text>
                        <Text className="text-text-muted text-sm flex-1">{it}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </Card>
            </>
          )}
        </>
      )}
      <View className="h-4" />
    </Screen>
  );
}
