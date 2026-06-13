import { Text, View } from 'react-native';

import { ScoreRing } from '@/components/ScoreRing';
import { Card, CardTitle } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { recoveryColor } from '@/theme/colors';
import type { WhoopCycle } from '@/types/models';
import { decimal, formatMinutesAsHm, num } from '@/utils/format';
import { prettyDate } from '@/utils/date';

interface WhoopSummaryProps {
  cycle: WhoopCycle | null;
}

export function WhoopSummary({ cycle }: WhoopSummaryProps) {
  if (!cycle) {
    return (
      <Card>
        <CardTitle>Latest Whoop</CardTitle>
        <Text className="text-text-muted text-sm">
          No Whoop data yet. Connect Whoop and run a sync to pull your recovery,
          HRV, sleep, and strain.
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider">
          Whoop · {prettyDate(cycle.date)}
        </Text>
      </View>
      <View className="flex-row items-center mb-4">
        <ScoreRing score={cycle.recoveryScore} size={92} strokeWidth={9} />
        <View className="flex-1 ml-4 flex-row flex-wrap gap-y-3">
          <Stat
            label="Recovery"
            value={num(cycle.recoveryScore, '%')}
            valueColor={recoveryColor(cycle.recoveryScore)}
          />
          <Stat label="Day Strain" value={decimal(cycle.dayStrain, 1)} />
        </View>
      </View>
      <View className="flex-row flex-wrap gap-y-3">
        <Stat label="HRV" value={num(cycle.hrvMs, ' ms')} />
        <Stat label="RHR" value={num(cycle.rhrBpm, ' bpm')} />
        <Stat label="Sleep" value={formatMinutesAsHm(cycle.sleepDurationMin)} />
        <Stat label="Sleep Perf" value={num(cycle.sleepPerformance, '%')} />
        <Stat label="Skin Temp" value={decimal(cycle.skinTempC, 1, '°C')} />
        <Stat label="SpO₂" value={decimal(cycle.spo2, 1, '%')} />
        <Stat label="Resp Rate" value={decimal(cycle.respiratoryRate, 1)} />
        <Stat label="Sleep Eff" value={num(cycle.sleepEfficiency, '%')} />
      </View>
    </Card>
  );
}
