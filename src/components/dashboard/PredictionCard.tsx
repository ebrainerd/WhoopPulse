import { Pressable, Text, View } from 'react-native';

import { ScoreRing } from '@/components/ScoreRing';
import { predictionVerdict } from '@/prediction/engine';
import { recoveryColor, recoveryLabel } from '@/theme/colors';
import type { Prediction } from '@/types/models';
import { signed } from '@/utils/format';

interface PredictionCardProps {
  prediction: Prediction;
  onWhatIf?: () => void;
}

export function PredictionCard({ prediction, onWhatIf }: PredictionCardProps) {
  const { predictedScore, confidence, baseline, factors } = prediction;
  const color = recoveryColor(predictedScore);
  const topFactors = factors.slice(0, 3);

  return (
    <View
      className="rounded-3xl p-5 border"
      style={{ backgroundColor: '#10161F', borderColor: color }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider">
          Predicted Recovery · Tomorrow
        </Text>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: `${color}22` }}
        >
          <Text className="text-xs font-bold" style={{ color }}>
            {recoveryLabel(predictedScore)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <ScoreRing score={predictedScore} size={128} strokeWidth={11} />
        <View className="flex-1 ml-4">
          <Text className="text-text-muted text-sm">
            ±{confidence} pts confidence
          </Text>
          <Text className="text-text text-base font-semibold mt-1">
            {predictionVerdict(predictedScore)}
          </Text>
          <Text className="text-text-faint text-xs mt-2">
            Baseline {Math.round(baseline)} · model adjustments{' '}
            {signed(predictedScore - baseline)}
          </Text>
        </View>
      </View>

      {topFactors.length > 0 && (
        <View className="mt-4 pt-4 border-t border-border-subtle">
          <Text className="text-text-faint text-[11px] uppercase tracking-wide mb-2">
            Top drivers
          </Text>
          {topFactors.map((f) => (
            <View
              key={f.key}
              className="flex-row items-center justify-between py-0.5"
            >
              <Text className="text-text-muted text-sm">{f.label}</Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: f.impact >= 0 ? '#34D399' : '#F87171' }}
              >
                {signed(f.impact)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {onWhatIf && (
        <Pressable
          onPress={onWhatIf}
          className="mt-4 rounded-xl bg-bg-input border border-border py-2.5 active:opacity-80"
        >
          <Text className="text-accent text-center font-semibold">
            Open What-If simulator
          </Text>
        </Pressable>
      )}
    </View>
  );
}
