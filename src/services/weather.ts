import { supabase } from '@/lib/supabase';
import type { WeatherForecast } from '@/types/models';
import { toDateKey, tomorrowKey } from '@/utils/date';

import { mapWeatherRow } from './mappers';

const WMO: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
  99: 'Thunderstorm w/ hail',
};

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_min: number[];
  temperature_2m_max: number[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
  weather_code: number[];
}

/**
 * Fetches a multi-day forecast from Open-Meteo (no API key required).
 * Returns one `WeatherForecast` per day, oldest first.
 */
export async function fetchForecast(
  lat: number,
  lng: number,
  days = 3,
): Promise<WeatherForecast[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,wind_speed_10m_max,weather_code` +
    `&timezone=auto&forecast_days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
  const json = (await res.json()) as { daily: OpenMeteoDaily };
  const d = json.daily;
  return d.time.map((date, i) => ({
    date,
    tempMinC: d.temperature_2m_min[i] ?? null,
    tempMaxC: d.temperature_2m_max[i] ?? null,
    overnightLowC: d.temperature_2m_min[i] ?? null,
    precipitationMm: d.precipitation_sum[i] ?? null,
    windKph: d.wind_speed_10m_max[i] ?? null,
    description: WMO[d.weather_code[i]] ?? null,
  }));
}

export async function getTomorrowForecast(
  lat: number,
  lng: number,
): Promise<WeatherForecast | null> {
  const list = await fetchForecast(lat, lng, 3);
  const target = tomorrowKey();
  return list.find((f) => f.date === target) ?? list[1] ?? null;
}

export async function getTodayForecast(
  lat: number,
  lng: number,
): Promise<WeatherForecast | null> {
  const list = await fetchForecast(lat, lng, 2);
  const target = toDateKey();
  return list.find((f) => f.date === target) ?? list[0] ?? null;
}

/** Persists a forecast snapshot for history / accuracy review (best-effort). */
export async function saveWeather(
  userId: string,
  f: WeatherForecast,
): Promise<void> {
  const { error } = await supabase.from('weather_daily').upsert(
    {
      user_id: userId,
      date: f.date,
      temp_min_c: f.tempMinC,
      temp_max_c: f.tempMaxC,
      overnight_low_c: f.overnightLowC,
      precipitation_mm: f.precipitationMm,
      wind_kph: f.windKph,
      description: f.description,
    },
    { onConflict: 'user_id,date' },
  );
  if (error) throw error;
}

export async function getStoredWeather(
  userId: string,
  date: string,
): Promise<WeatherForecast | null> {
  const { data, error } = await supabase
    .from('weather_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data ? mapWeatherRow(data) : null;
}
