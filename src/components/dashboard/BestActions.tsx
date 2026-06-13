import { Pressable, Text, View } from 'react-native';

import { Card, CardTitle } from '@/components/ui/Card';
import type { Recommendation, RecommendationLog } from '@/types/models';

interface BestActionsProps {
  recommendations: Recommendation[];
  logs: RecommendationLog[];
  onToggle: (key: string, followed: boolean) => void;
}

export function BestActions({
  recommendations,
  logs,
  onToggle,
}: BestActionsProps) {
  const followedSet = new Set(
    logs.filter((l) => l.followed).map((l) => l.actionKey),
  );

  return (
    <Card>
      <CardTitle>Best Actions Today</CardTitle>
      {recommendations.length === 0 ? (
        <Text className="text-text-muted text-sm">
          You’re dialed in — no high-impact changes detected for tomorrow. Keep
          the streak going.
        </Text>
      ) : (
        recommendations.map((rec) => {
          const done = followedSet.has(rec.key);
          return (
            <Pressable
              key={rec.key}
              onPress={() => onToggle(rec.key, !done)}
              className="flex-row items-start py-2.5 active:opacity-70"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 mt-0.5 ${
                  done ? 'bg-accent border-accent' : 'border-border'
                }`}
              >
                {done && <Text className="text-bg text-xs font-bold">✓</Text>}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-text font-semibold flex-1 pr-2 ${
                      done ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {rec.title}
                  </Text>
                  <Text className="text-recovery-high text-sm font-bold">
                    +{rec.impactPoints}
                  </Text>
                </View>
                <Text className="text-text-muted text-xs mt-0.5">{rec.detail}</Text>
              </View>
            </Pressable>
          );
        })
      )}
    </Card>
  );
}
