import { Redirect, Stack } from 'expo-router';

import { Splash } from '@/components/ui/Splash';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) return <Splash />;
  if (session) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
