import { View } from 'react-native';

import {
  Field,
  Scale5,
  Segmented,
  Stepper,
  TimeField,
  ToggleRow,
} from '@/components/form/Controls';
import { Card } from '@/components/ui/Card';
import { TRAINING_TYPES, type JournalEntry, type TrainingType } from '@/types/models';

interface JournalFormProps {
  value: JournalEntry;
  onChange: (next: JournalEntry) => void;
}

// MVP keeps training to the highest-signal options.
const MVP_TRAINING: { value: TrainingType; label: string }[] = TRAINING_TYPES.filter(
  (t) => t.value !== 'active_recovery',
);

/**
 * Minimal, high-signal daily journal. Designed to complete in <30 seconds:
 * training, alcohol, two supplement toggles, wind-down time, and lightweight
 * energy/mood/stress — plus two optional levers.
 */
export function JournalForm({ value, onChange }: JournalFormProps) {
  const set = <K extends keyof JournalEntry>(key: K, v: JournalEntry[K]) =>
    onChange({ ...value, [key]: v });

  const toggleMagnesium = () => {
    const has = value.supplements.includes('magnesium');
    set(
      'supplements',
      has
        ? value.supplements.filter((x) => x !== 'magnesium')
        : [...value.supplements, 'magnesium'],
    );
  };

  return (
    <View>
      <Card className="mb-4">
        <Field label="Training">
          <Segmented
            options={MVP_TRAINING}
            value={value.trainingType}
            onChange={(v) => set('trainingType', v)}
          />
        </Field>
        {value.trainingType !== 'rest' && (
          <Field label="Intensity">
            <Scale5
              value={value.trainingIntensity}
              onChange={(v) => set('trainingIntensity', v)}
              lowLabel="Easy"
              highLabel="Max"
            />
          </Field>
        )}
      </Card>

      <Card className="mb-4">
        <Field label="Alcohol" hint="Drinks today — the single biggest lever.">
          <Stepper
            value={value.alcoholDrinks}
            onChange={(v) => set('alcoholDrinks', v)}
            min={0}
            max={20}
          />
        </Field>
        <View className="gap-1">
          <ToggleRow
            label="Creatine"
            value={value.creatine}
            onChange={(v) => set('creatine', v)}
          />
          <ToggleRow
            label="Magnesium"
            value={value.supplements.includes('magnesium')}
            onChange={toggleMagnesium}
          />
        </View>
      </Card>

      <Card className="mb-4">
        <Field
          label="Wind-down / lights out"
          hint="When you start winding down for bed."
        >
          <TimeField
            value={value.winddownTime}
            onChange={(v) => set('winddownTime', v)}
          />
        </Field>
      </Card>

      <Card className="mb-4">
        <Field label="Energy">
          <Scale5
            value={value.energy}
            onChange={(v) => set('energy', v)}
            lowLabel="Drained"
            highLabel="Wired"
          />
        </Field>
        <Field label="Mood">
          <Scale5
            value={value.mood}
            onChange={(v) => set('mood', v)}
            lowLabel="Low"
            highLabel="Great"
          />
        </Field>
        <Field label="Stress">
          <Scale5
            value={value.workStress}
            onChange={(v) => set('workStress', v)}
            lowLabel="Calm"
            highLabel="Maxed"
          />
        </Field>
      </Card>

      <Card className="mb-4">
        <Field label="Optional">
          <View className="gap-2">
            <ToggleRow
              label="Caffeine after 2 PM"
              value={value.caffeineAfter2pm}
              onChange={(v) => set('caffeineAfter2pm', v)}
            />
            <View>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ToggleRow
                    label="Hydrated (3L+)"
                    value={(value.waterLiters ?? 0) >= 3}
                    onChange={(v) => set('waterLiters', v ? 3 : null)}
                  />
                </View>
              </View>
            </View>
          </View>
        </Field>
      </Card>
    </View>
  );
}
