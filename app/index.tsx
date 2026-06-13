import { Redirect } from 'expo-router';

import { Splash } from '@/components/ui/Splash';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export default function Index() {
  const { session, loading } = useAuth();
  const { profile, loading: dataLoading } = useData();

  if (loading) return <Splash />;
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (dataLoading) return <Splash message="Loading your data…" />;
  if (!profile?.onboardedAt) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
