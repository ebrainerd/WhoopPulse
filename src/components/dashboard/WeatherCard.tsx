import { Text, View } from 'react-native';

import { Card, CardTitle } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import type { WeatherForecast } from '@/types/models';
import { cToF, decimal } from '@/utils/format';

interface WeatherCardProps {
  weather: WeatherForecast | null;
  locationName?: string | null;
}

export function WeatherCard({ weather, locationName }: WeatherCardProps) {
  if (!weather) return null;
  const fLow = cToF(weather.overnightLowC);
  return (
    <Card>
      <CardTitle>Tomorrow’s Forecast{locationName ? ` · ${locationName}` : ''}</CardTitle>
      <View className="flex-row items-center justify-between">
        <Text className="text-text text-base font-semibold">
          {weather.description ?? '—'}
        </Text>
        <Text className="text-text-muted text-sm">
          {decimal(weather.tempMinC, 0, '°')} / {decimal(weather.tempMaxC, 0, '°C')}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-y-3 mt-3">
        <Stat
          label="Overnight Low"
          value={`${decimal(weather.overnightLowC, 0, '°C')}${
            fLow != null ? ` / ${Math.round(fLow)}°F` : ''
          }`}
          hint={
            weather.overnightLowC != null && weather.overnightLowC > 20
              ? 'Warm — cool the room'
              : 'Good for sleep'
          }
        />
        <Stat label="Precip" value={decimal(weather.precipitationMm, 1, ' mm')} />
        <Stat label="Wind" value={decimal(weather.windKph, 0, ' kph')} />
      </View>
    </Card>
  );
}
