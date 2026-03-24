import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Building2, Briefcase, UserRound } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import type { MembershipRole } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignupOnboarding'>;

const ROLE_OPTIONS: { value: MembershipRole; label: string }[] = [
  { value: 'tenant-superuser', label: 'Tenant Superuser' },
  { value: 'member', label: 'Member' },
  { value: 'global-superuser', label: 'Global Superuser' },
];
const PERSONA_OPTIONS = ['Asset Manager', 'Research Analyst', 'Executive', 'Risk Officer'];

export function SignupOnboardingScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [selectedRole, setSelectedRole] = useState<MembershipRole>('tenant-superuser');
  const [selectedPersona, setSelectedPersona] = useState('Asset Manager');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');

  const handleCompleteSignup = useCallback(async () => {
    setError('');

    try {
      const result = await register({
        name: route.params.name,
        email: route.params.email,
        password: route.params.password,
        role: selectedRole,
        persona: selectedPersona,
        tenantName: tenantName.trim(),
        rememberSession: route.params.rememberSession,
      });

      if (result.needsTenantSelect) {
        navigation.navigate('TenantSelect');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to complete account setup right now.');
    }
  }, [navigation, register, route.params.email, route.params.name, route.params.password, route.params.rememberSession, selectedPersona, selectedRole, tenantName]);

  return (
    <ScreenContainer padded={false}>
      <StatusBar style={colors.statusBarStyle === 'dark' ? 'dark' : 'light'} />
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to sign up"
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[typePresets.h1, { color: colors.text }]}>Finish Account Setup</Text>
          <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            One last step to shape your workspace and analyst context.
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>ACCOUNT</Text>
          <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.sm }]}>
            {route.params.name}
          </Text>
          <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
            {route.params.email}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Briefcase size={18} color={colors.primary} strokeWidth={2} />
            <Text style={[typePresets.h3, { color: colors.text }]}>Access Role</Text>
          </View>
          <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
            Set the default level of control for this new account.
          </Text>
          <View style={styles.optionRow}>
            {ROLE_OPTIONS.map((role) => (
              <Chip
                key={role.value}
                label={role.label}
                selected={selectedRole === role.value}
                onPress={() => setSelectedRole(role.value)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserRound size={18} color={colors.primary} strokeWidth={2} />
            <Text style={[typePresets.h3, { color: colors.text }]}>Analyst Persona</Text>
          </View>
          <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
            Personalize summaries and reports for how you work.
          </Text>
          <View style={styles.optionRow}>
            {PERSONA_OPTIONS.map((persona) => (
              <Chip
                key={persona}
                label={persona}
                selected={selectedPersona === persona}
                onPress={() => setSelectedPersona(persona)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Building2 size={18} color={colors.primary} strokeWidth={2} />
            <Text style={[typePresets.h3, { color: colors.text }]}>Workspace</Text>
          </View>
          <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
            Create a workspace now, or leave this blank and join one later.
          </Text>
          <Input
            label="Workspace Name"
            placeholder="NewsFlash Research"
            value={tenantName}
            onChangeText={setTenantName}
            hint="Optional during account creation."
          />
        </Animated.View>

        {error ? (
          <Text style={[typePresets.bodySm, styles.errorText, { color: colors.danger }]}>
            {error}
          </Text>
        ) : null}

        <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.actions}>
          <Button
            label="Create Account"
            onPress={handleCompleteSignup}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: spacing.base,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  actions: {
    paddingTop: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
