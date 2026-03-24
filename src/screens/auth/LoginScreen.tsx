import React, { useState, useCallback } from 'react';
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
import { useAuthStore } from '@/store/authStore';
import { requestPasswordReset } from '@/services/auth';
import type { MembershipRole } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type AuthMode = 'signin' | 'signup';

const DEMO_EMAILS = ['demo@newsflash.ai', 'analyst@newsflash.ai', 'executive@newsflash.ai'];
const ROLE_OPTIONS: { value: MembershipRole; label: string }[] = [
  { value: 'tenant-superuser', label: 'Tenant Superuser' },
  { value: 'member', label: 'Member' },
  { value: 'global-superuser', label: 'Global Superuser' },
];

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const signIn = useAuthStore((state) => state.signIn);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('demo@newsflash.ai');
  const [password, setPassword] = useState('demo123');
  const [selectedRole, setSelectedRole] = useState<MembershipRole>('tenant-superuser');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleAuth = useCallback(async () => {
    if (!email || !password || (mode === 'signup' && !name.trim())) {
      setError(mode === 'signup' ? 'Complete name, email, and password to create an account.' : 'Please enter your email and password.');
      return;
    }

    setError('');
    setNotice('');

    try {
      const result = mode === 'signin'
        ? await signIn(email, password)
        : await register({
            name: name.trim(),
            email,
            password,
            role: selectedRole,
            tenantName: tenantName.trim(),
          });

      if (result.needsTenantSelect) {
        navigation.navigate('TenantSelect');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  }, [email, mode, name, navigation, password, register, selectedRole, signIn, tenantName]);

  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      setError('Enter your email first, then request a reset link.');
      return;
    }

    setError('');
    await requestPasswordReset(email.trim());
    setNotice(`Password reset instructions sent to ${email.trim()}.`);
  }, [email]);

  const passwordToggle = (
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
  );

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
            <Chip label="Sign In" selected={mode === 'signin'} onPress={() => setMode('signin')} />
            <Chip label="Sign Up" selected={mode === 'signup'} onPress={() => setMode('signup')} />
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
                <Input
                  label="Workspace Name"
                  placeholder="NewsFlash Research"
                  value={tenantName}
                  onChangeText={setTenantName}
                  hint="Leave blank to finish account setup without creating a workspace."
                />
                <View style={styles.roleBlock}>
                  <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                    Role
                  </Text>
                  <View style={styles.roleRow}>
                    {ROLE_OPTIONS.map((role) => (
                      <Chip
                        key={role.value}
                        label={role.label}
                        selected={selectedRole === role.value}
                        onPress={() => setSelectedRole(role.value)}
                      />
                    ))}
                  </View>
                </View>
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
              error={error}
              rightIcon={passwordToggle}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.demoRow}>
              {DEMO_EMAILS.map((demoEmail) => (
                <Chip key={demoEmail} label={demoEmail} selected={email === demoEmail} onPress={() => setEmail(demoEmail)} />
              ))}
            </ScrollView>

            {notice ? (
              <Text style={[typePresets.bodySm, { color: colors.primary, marginTop: spacing.sm }]}>
                {notice}
              </Text>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify().damping(15)} style={styles.actions}>
            <Button
              label={mode === 'signin' ? 'Sign In' : 'Create Account'}
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
  roleBlock: {
    marginBottom: spacing.base,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  demoRow: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
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
