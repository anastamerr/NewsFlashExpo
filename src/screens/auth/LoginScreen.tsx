import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Zap } from 'lucide-react-native';
import { useTheme, spacing, palette } from '@/theme';
import { typePresets, fontFamily } from '@/theme/typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError('');
    try {
      const { needsTenantSelect } = await signIn(email, password);
      if (needsTenantSelect) {
        navigation.navigate('TenantSelect');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  }, [email, password, signIn, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBarStyle === 'dark' ? 'dark' : 'light'} />
      <LinearGradient
        colors={['transparent', palette.periwinkle + '08', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeIn.delay(100).duration(600)} style={styles.logoSection}>
          <View style={[styles.logoIcon, { backgroundColor: palette.periwinkle + '15' }]}>
            <Zap size={32} color={palette.periwinkle} fill={palette.periwinkle} strokeWidth={0} />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>NewsFlash</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Content Intelligence
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify().damping(15)} style={styles.form}>
          <Input
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            error={error}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify().damping(15)} style={styles.actions}>
          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(700).duration(400)}>
          <Text style={[typePresets.bodySm, { color: colors.textTertiary, textAlign: 'center' }]}>
            Powered by NewsFlash AI
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  logoText: {
    fontFamily: fontFamily.serifBold,
    fontSize: 36,
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: fontFamily.serifItalic,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.xxs,
  },
  form: {
    marginBottom: spacing.lg,
  },
  actions: {
    marginBottom: spacing.xxl,
  },
});
