import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BackgroundScreen } from '@/components/ui/BackgroundScreen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

export default function SignIn() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) {
          setInfo('Check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BackgroundScreen image="coast" scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center"
      >
        <Text className="text-accent text-3xl font-extrabold">
          Recovery Journal
        </Text>
        <Text className="text-text-muted mt-2 mb-8">
          Your personal Whoop recovery coach. Predict tomorrow, act today.
        </Text>

        <View className="gap-3">
          <View>
            <Text className="text-text-muted text-xs mb-1.5 ml-1">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textFaint}
              className="bg-bg-input border border-border rounded-xl px-4 py-3 text-text"
            />
          </View>
          <View>
            <Text className="text-text-muted text-xs mb-1.5 ml-1">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.textFaint}
              className="bg-bg-input border border-border rounded-xl px-4 py-3 text-text"
            />
          </View>
        </View>

        {error ? (
          <Text className="text-recovery-low text-sm mt-3">{error}</Text>
        ) : null}
        {info ? (
          <Text className="text-recovery-high text-sm mt-3">{info}</Text>
        ) : null}

        <View className="mt-6">
          <Button
            title={mode === 'signin' ? 'Sign In' : 'Create Account'}
            onPress={submit}
            loading={busy}
          />
        </View>

        <Pressable
          onPress={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setInfo(null);
          }}
          className="mt-5"
        >
          <Text className="text-text-muted text-center text-sm">
            {mode === 'signin'
              ? 'No account? '
              : 'Already have an account? '}
            <Text className="text-accent font-semibold">
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </BackgroundScreen>
  );
}
