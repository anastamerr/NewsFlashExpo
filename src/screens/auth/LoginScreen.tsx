import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Eye, EyeOff, Zap } from 'lucide-react-native';
import { useTheme, spacing, palette, radius } from '@/theme';
import { typePresets, fontFamily } from '@/theme/typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Toggle } from '@/components/ui/Toggle';
import { useAuthStore } from '@/store/authStore';
import { requestPasswordReset } from '@/services/auth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type AuthMode = 'signin' | 'signup';

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@newsflash.ai');
  const [password, setPassword] = useState('demo123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const passwordToggle = useMemo(() => (
    <Pressable
      onPress={() => setShowPassword((current) => !current)}
      accessibilityRole="button"
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {showPassword ? (
        <EyeOff size={18} color={colors.textTertiary} strokeWidth={2} />
      ) : (
        <Eye size={18} color={colors.textTertiary} strokeWidth={2} />
      )}
    </Pressable>
  ), [colors.textTertiary, showPassword]);

  const confirmPasswordToggle = useMemo(() => (
    <Pressable
      onPress={() => setShowConfirmPassword((current) => !current)}
      accessibilityRole="button"
      accessibilityLabel={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {showConfirmPassword ? (
        <EyeOff size={18} color={colors.textTertiary} strokeWidth={2} />
      ) : (
        <Eye size={18} color={colors.textTertiary} strokeWidth={2} />
      )}
    </Pressable>
  ), [colors.textTertiary, showConfirmPassword]);

  const handleModeChange = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  }, []);

  const handleAuth = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError(mode === 'signup' ? 'Complete the required account fields to continue.' : 'Please enter your email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Add your full name to create the account.');
        return;
      }

      if (password.length < 6) {
        setError('Use at least 6 characters for the account password.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Password confirmation does not match.');
        return;
      }
    }

    setError('');
    setNotice('');

    try {
      if (mode === 'signup') {
        navigation.navigate('SignupOnboarding', {
          name: name.trim(),
          email: trimmedEmail,
          password,
          rememberSession,
        });
        return;
      }

      const result = await signIn(trimmedEmail, password, rememberSession);
      if (result.needsTenantSelect) {
        navigation.navigate('TenantSelect');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  }, [confirmPassword, email, mode, name, navigation, password, rememberSession, signIn]);

  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      setError('Enter your email first, then request a reset link.');
      return;
    }

    setError('');
    setNotice('');

    try {
      await requestPasswordReset(email.trim());
      setNotice(`Password reset instructions sent to ${email.trim()}.`);
    } catch (err: any) {
      setError(err.message || 'Unable to send reset instructions right now.');
    }
  }, [email]);

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
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeIn.delay(100).duration(600)} style={styles.logoSection}>
            <View style={[styles.logoIcon, { backgroundColor: palette.periwinkle + '15' }]}>
              <Zap size={32} color={palette.periwinkle} fill={palette.periwinkle} strokeWidth={0} />
            </View>
            <Text style={[styles.logoText, { color: colors.text }]}>NewsFlash</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Content Intelligence
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220).springify().damping(15)} style={styles.modeRow}>
            <Chip label="Sign In" selected={mode === 'signin'} onPress={() => handleModeChange('signin')} />
            <Chip label="Sign Up" selected={mode === 'signup'} onPress={() => handleModeChange('signup')} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify().damping(15)} style={styles.form}>
            {mode === 'signup' ? (
              <>
                <Input
                  label="Full Name"
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                />
              </>
            ) : null}

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
              secureTextEntry={!showPassword}
              autoComplete={mode === 'signin' ? 'password' : 'new-password'}
              rightIcon={passwordToggle}
            />

            {mode === 'signup' ? (
              <Input
                label="Confirm Password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                rightIcon={confirmPasswordToggle}
              />
            ) : null}

            {mode === 'signup' ? (
              <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
                Role, persona, and workspace setup continue on the next step.
              </Text>
            ) : null}

            <View
              style={[
                styles.utilityRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.utilityCopy}>
                <Text style={[typePresets.labelSm, { color: colors.text }]}>Remember this device</Text>
                <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
                  Keep the session after the app restarts.
                </Text>
              </View>
              <Toggle value={rememberSession} onValueChange={setRememberSession} />
            </View>

            {error ? (
              <Text style={[typePresets.bodySm, styles.feedbackText, { color: colors.danger }]}>
                {error}
              </Text>
            ) : null}

            {notice ? (
              <Text style={[typePresets.bodySm, styles.feedbackText, { color: colors.primary }]}>
                {notice}
              </Text>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify().damping(15)} style={styles.actions}>
            <Button
              label={mode === 'signin' ? 'Sign In' : 'Continue'}
              onPress={handleAuth}
              loading={isLoading}
              fullWidth
              size="lg"
            />
            {mode === 'signin' ? (
              <Pressable onPress={handleForgotPassword} style={({ pressed }) => [styles.resetLink, pressed && styles.pressed]}>
                <Text style={[typePresets.labelSm, { color: colors.primary }]}>Forgot password?</Text>
              </Pressable>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeIn.delay(700).duration(400)}>
            <Text style={[typePresets.bodySm, { color: colors.textTertiary, textAlign: 'center' }]}>
              Powered by NewsFlash AI
            </Text>
          </Animated.View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
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
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  form: {
    marginBottom: spacing.lg,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.base,
  },
  utilityCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  feedbackText: {
    marginTop: spacing.sm,
  },
  actions: {
    marginBottom: spacing.xxl,
  },
  resetLink: {
    alignSelf: 'center',
    marginTop: spacing.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.8,
  },
});
