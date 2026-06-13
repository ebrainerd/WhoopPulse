import { TextInput, View } from 'react-native';

import {
  Field,
  Scale5,
  Segmented,
  Stepper,
  TimeField,
  ToggleRow,
} from '@/components/form/Controls';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { colors } from '@/theme/colors';
import {
  SUPPLEMENTS,
  TRAINING_TYPES,
  type JournalEntry,
} from '@/types/models';

interface JournalFormProps {
  value: JournalEntry;
  onChange: (next: JournalEntry) => void;
}

export function JournalForm({ value, onChange }: JournalFormProps) {
  const set = <K extends keyof JournalEntry>(key: K, v: JournalEntry[K]) =>
    onChange({ ...value, [key]: v });

  const toggleSupplement = (s: string) => {
    const has = value.supplements.includes(s);
    set(
      'supplements',
      has
        ? value.supplements.filter((x) => x !== s)
        : [...value.supplements, s],
    );
  };

  return (
    <View>
      <Card className="mb-4">
        <Field label="Training" hint="What did you train today?">
          <Segmented
            options={TRAINING_TYPES.map((t) => ({ label: t.label, value: t.value }))}
            value={value.trainingType}
            onChange={(v) => set('trainingType', v)}
          />
        </Field>
        {value.trainingType !== 'rest' && (
          <Field label="Training intensity">
            <Scale5
              value={value.trainingIntensity}
              onChange={(v) => set('trainingIntensity', v)}
              lowLabel="Easy"
              highLabel="Max"
            />
          </Field>
        )}
        <Field label="Training notes">
          <NotesInput
            value={value.trainingNotes}
            placeholder="Lifts, sets, PRs, how it felt…"
            onChange={(t) => set('trainingNotes', t)}
          />
        </Field>
      </Card>

      <Card className="mb-4">
        <Field label="Alcohol" hint="Number of drinks today.">
          <Stepper
            value={value.alcoholDrinks}
            onChange={(v) => set('alcoholDrinks', v)}
            min={0}
            max={20}
          />
        </Field>
        <Field label="Last meal" hint="When you finished eating.">
          <TimeField
            value={value.lastMealTime}
            onChange={(v) => set('lastMealTime', v)}
            quickTimes={['18:00', '19:00', '20:00', '21:00', '22:00']}
          />
        </Field>
        <Field label="Planned fasting window (hours)">
          <Stepper
            value={value.fastingHours ?? 0}
            onChange={(v) => set('fastingHours', v === 0 ? null : v)}
            min={0}
            max={24}
            suffix="h"
          />
        </Field>
        <Field label="Water (liters)">
          <Stepper
            value={value.waterLiters ?? 0}
            onChange={(v) => set('waterLiters', v === 0 ? null : v)}
            min={0}
            max={8}
            step={0.5}
            suffix="L"
          />
        </Field>
        <ToggleRow
          label="Caffeine after 2 PM"
          value={value.caffeineAfter2pm}
          onChange={(v) => set('caffeineAfter2pm', v)}
        />
      </Card>

      <Card className="mb-4">
        <Field label="Supplements" hint="Tap all you took today.">
          <View className="flex-row flex-wrap">
            {SUPPLEMENTS.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                selected={
                  value.supplements.includes(s.value) ||
                  (s.value === 'creatine' && value.creatine)
                }
                onPress={() => {
                  if (s.value === 'creatine') {
                    set('creatine', !value.creatine);
                  }
                  toggleSupplement(s.value);
                }}
              />
            ))}
          </View>
        </Field>
      </Card>

      <Card className="mb-4">
        <Field label="Energy">
          <Scale5
            value={value.energy}
            onChange={(v) => set('energy', v)}
            lowLabel="Drained"
            highLabel="Energized"
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
        <Field label="Work stress">
          <Scale5
            value={value.workStress}
            onChange={(v) => set('workStress', v)}
            lowLabel="Calm"
            highLabel="Maxed"
          />
        </Field>
      </Card>

      <Card className="mb-4">
        <Field label="Wind-down time" hint="When you started winding down for bed.">
          <TimeField
            value={value.winddownTime}
            onChange={(v) => set('winddownTime', v)}
          />
        </Field>
        <Field label="Notes">
          <NotesInput
            value={value.notes}
            placeholder="Anything else worth remembering…"
            onChange={(t) => set('notes', t)}
          />
        </Field>
      </Card>
    </View>
  );
}

function NotesInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (t: string) => void;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      multiline
      className="bg-bg-input border border-border rounded-xl px-4 py-3 text-text min-h-[64px]"
      style={{ textAlignVertical: 'top' }}
    />
  );
}
