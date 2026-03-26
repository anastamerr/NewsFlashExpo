import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Bell, Radio, Users, Info, LogOut,
  ChevronRight, Sun, Moon, Monitor, Shield, UserRound,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { StateBlock } from '@/components/ui/StateBlock';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import {
  getStoredAdminSettings,
  saveStoredAdminSettings,
  type AdminSettings,
  type DeliveryChannel,
  type SeverityFilter,
} from '@/utils/adminPersistence';
import { successNotification } from '@/utils/haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
type AccountDraft = Pick<AdminSettings, 'profileName' | 'profileEmail' | 'persona' | 'timezone' | 'language'>;

const PERSONA_OPTIONS = ['Asset Manager', 'Research Analyst', 'Executive', 'Risk Officer'];
const CHANNEL_OPTIONS: { label: string; value: DeliveryChannel }[] = [
  { label: 'Push', value: 'push' },
  { label: 'Email', value: 'email' },
  { label: 'In-App', value: 'in-app' },
];
const SEVERITY_OPTIONS: SeverityFilter[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  danger,
  rightElement,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !rightElement}
      style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}
    >
      <Icon size={20} color={danger ? colors.danger : colors.textSecondary} strokeWidth={1.8} />
      <Text style={[typePresets.body, { color: danger ? colors.danger : colors.text, flex: 1 }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[typePresets.bodySm, { color: colors.textTertiary, marginRight: spacing.sm }]}>
          {value}
        </Text>
      ) : null}
      {rightElement}
      {onPress && !rightElement ? <ChevronRight size={18} color={colors.textTertiary} strokeWidth={1.8} /> : null}
    </Pressable>
  );
}

function buildDefaultSettings(user: ReturnType<typeof useAuthStore.getState>['user']): AdminSettings {
  return {
    profileName: user?.name ?? 'User',
    profileEmail: user?.email ?? 'user@example.com',
    persona: user?.persona ?? 'Asset Manager',
    timezone: 'Africa/Cairo',
    language: 'English',
    pushNotifications: true,
    crisisAlerts: true,
    dailyDigest: false,
    deliveryChannels: ['push', 'email', 'in-app'],
    severityFilters: ['CRITICAL', 'HIGH'],
    sessionLock: true,
    biometricUnlock: false,
  };
}

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const defaultSettings = useMemo(() => buildDefaultSettings(user), [user]);
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [isHydrating, setIsHydrating] = useState(true);
  const [accountSheetVisible, setAccountSheetVisible] = useState(false);
  const [screenError, setScreenError] = useState('');
  const [screenNotice, setScreenNotice] = useState('');
  const scrollY = useSharedValue(0);
  const [accountDraft, setAccountDraft] = useState<AccountDraft>({
    profileName: defaultSettings.profileName,
    profileEmail: defaultSettings.profileEmail,
    persona: defaultSettings.persona,
    timezone: defaultSettings.timezone,
    language: defaultSettings.language,
  });

  useEffect(() => {
    let isMounted = true;

    getStoredAdminSettings(defaultSettings).then((storedSettings) => {
      if (!isMounted) {
        return;
      }

      const mergedSettings = { ...defaultSettings, ...storedSettings };
      setSettings(mergedSettings);
      setAccountDraft({
        profileName: mergedSettings.profileName,
        profileEmail: mergedSettings.profileEmail,
        persona: mergedSettings.persona,
        timezone: mergedSettings.timezone,
        language: mergedSettings.language,
      });
      setIsHydrating(false);
    }).catch(() => {
      if (!isMounted) {
        return;
      }

      setScreenError('Settings could not be loaded. Reopen the screen to retry.');
      setIsHydrating(false);
    });

    return () => {
      isMounted = false;
    };
  }, [defaultSettings]);

  const persistSettings = useCallback(async (nextSettings: AdminSettings) => {
    setScreenError('');
    setScreenNotice('');

    try {
      setSettings(nextSettings);
      await saveStoredAdminSettings(nextSettings);
      setScreenNotice('Preferences saved.');
      return true;
    } catch {
      setScreenError('Unable to save preferences right now.');
      return false;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch {
      setScreenError('Sign out failed. Please try again.');
    }
  }, [signOut]);

  const updateBooleanSetting = useCallback(async (
    key: keyof Pick<AdminSettings, 'pushNotifications' | 'crisisAlerts' | 'dailyDigest' | 'sessionLock' | 'biometricUnlock'>,
    value: boolean,
  ) => {
    const nextSettings = { ...settings, [key]: value };
    await persistSettings(nextSettings);
  }, [persistSettings, settings]);

  const handleToggleChannel = useCallback(async (channel: DeliveryChannel) => {
    const nextChannels = settings.deliveryChannels.includes(channel)
      ? settings.deliveryChannels.filter((item) => item !== channel)
      : [...settings.deliveryChannels, channel];
    const nextSettings = { ...settings, deliveryChannels: nextChannels };

    await persistSettings(nextSettings);
  }, [persistSettings, settings]);

  const handleToggleSeverity = useCallback(async (severity: SeverityFilter) => {
    const nextFilters = settings.severityFilters.includes(severity)
      ? settings.severityFilters.filter((item) => item !== severity)
      : [...settings.severityFilters, severity];
    const nextSettings = { ...settings, severityFilters: nextFilters };

    await persistSettings(nextSettings);
  }, [persistSettings, settings]);

  const handleSaveAccount = useCallback(async () => {
    const nextSettings: AdminSettings = {
      ...settings,
      profileName: accountDraft.profileName.trim() || defaultSettings.profileName,
      profileEmail: accountDraft.profileEmail.trim() || defaultSettings.profileEmail,
      persona: accountDraft.persona.trim() || defaultSettings.persona,
      timezone: accountDraft.timezone.trim() || defaultSettings.timezone,
      language: accountDraft.language.trim() || defaultSettings.language,
    };

    const didSave = await persistSettings(nextSettings);

    if (!didSave) {
      return;
    }

    setAccountSheetVisible(false);
    successNotification();
  }, [accountDraft, defaultSettings, persistSettings, settings]);

  const deliverySummary = useMemo(() => (
    settings.deliveryChannels.length > 0 ? settings.deliveryChannels.join(', ') : 'No channels selected'
  ), [settings.deliveryChannels]);

  const severitySummary = useMemo(() => (
    settings.severityFilters.length > 0 ? settings.severityFilters.join(', ') : 'All severities muted'
  ), [settings.severityFilters]);

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [24, 96], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [24, 96], [10, 0], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Animated.Text style={[typePresets.h3, styles.headerTitle, { color: colors.text }, headerTitleStyle]}>
          Settings
        </Animated.Text>
      </View>

      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.heroBlock}>
          <Text style={[typePresets.h1, { color: colors.text }]}>Settings</Text>
        </View>

        {isHydrating ? (
          <StateBlock
            title="Loading settings"
            message="Preparing account preferences and delivery controls."
            loading
          />
        ) : null}

        {screenError ? (
          <View style={styles.stateWrap}>
            <StateBlock title="Settings unavailable" message={screenError} />
          </View>
        ) : null}

        {screenNotice ? (
          <Text style={[typePresets.bodySm, styles.noticeText, { color: colors.primary }]}>
            {screenNotice}
          </Text>
        ) : null}

        {!isHydrating ? (
          <>
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>PROFILE</Text>
          <Card onPress={() => setAccountSheetVisible(true)}>
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[typePresets.h2, { color: colors.primary }]}>
                  {(settings.profileName[0] || 'U').toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[typePresets.h3, { color: colors.text }]}>{settings.profileName}</Text>
                <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>{settings.profileEmail}</Text>
                <Text style={[typePresets.labelSm, { color: colors.primary, marginTop: 2 }]}>
                  {settings.persona}
                </Text>
                <Text style={[typePresets.labelXs, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
                  {settings.timezone} | {settings.language}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} strokeWidth={1.8} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>APPEARANCE</Text>
          <Card>
            <View style={styles.themeRow}>
              {[
                { key: 'light' as const, label: 'Light', Icon: Sun },
                { key: 'dark' as const, label: 'Dark', Icon: Moon },
                { key: 'system' as const, label: 'System', Icon: Monitor },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => setMode(option.key)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${option.label} theme`}
                  accessibilityState={{ selected: mode === option.key }}
                  style={({ pressed }) => [
                    styles.themeOption,
                    {
                      backgroundColor: mode === option.key ? colors.primary + '20' : colors.muted,
                      borderColor: mode === option.key ? colors.primary : 'transparent',
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <option.Icon size={18} color={mode === option.key ? colors.primary : colors.textSecondary} strokeWidth={2} />
                  <Text style={[typePresets.labelSm, { color: mode === option.key ? colors.primary : colors.textSecondary }]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>NOTIFICATIONS</Text>
          <Card>
            <SettingsRow
              icon={Bell}
              label="Push Notifications"
              rightElement={<Toggle value={settings.pushNotifications} onValueChange={(value) => updateBooleanSetting('pushNotifications', value)} />}
            />
            <SettingsRow
              icon={Bell}
              label="Crisis Alerts"
              rightElement={<Toggle value={settings.crisisAlerts} onValueChange={(value) => updateBooleanSetting('crisisAlerts', value)} />}
            />
            <SettingsRow
              icon={Bell}
              label="Daily Digest"
              rightElement={<Toggle value={settings.dailyDigest} onValueChange={(value) => updateBooleanSetting('dailyDigest', value)} />}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>DELIVERY</Text>
          <Card>
            <View>
              <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>Channels</Text>
              <Text style={[typePresets.bodySm, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
                {deliverySummary}
              </Text>
              <View style={styles.chipWrap}>
                {CHANNEL_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={settings.deliveryChannels.includes(option.value)}
                    onPress={() => handleToggleChannel(option.value)}
                  />
                ))}
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View>
              <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>Severity Thresholds</Text>
              <Text style={[typePresets.bodySm, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
                {severitySummary}
              </Text>
              <View style={styles.chipWrap}>
                {SEVERITY_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    selected={settings.severityFilters.includes(option)}
                    onPress={() => handleToggleSeverity(option)}
                  />
                ))}
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>DATA</Text>
          <Card>
            <SettingsRow icon={Radio} label="Content Sources" onPress={() => navigation.navigate('Sources')} />
            {user?.capabilities?.can_manage_users ? (
              <SettingsRow icon={Users} label="User Management" onPress={() => navigation.navigate('Users')} />
            ) : null}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>SECURITY</Text>
          <Card>
            <SettingsRow
              icon={Shield}
              label="Session Lock"
              rightElement={<Toggle value={settings.sessionLock} onValueChange={(value) => updateBooleanSetting('sessionLock', value)} />}
            />
            <SettingsRow
              icon={UserRound}
              label="Biometric Unlock"
              rightElement={<Toggle value={settings.biometricUnlock} onValueChange={(value) => updateBooleanSetting('biometricUnlock', value)} />}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>ABOUT</Text>
          <Card>
            <SettingsRow icon={Info} label="App Version" value="1.0.0" />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Card style={{ marginTop: spacing.xl }}>
            <SettingsRow icon={LogOut} label="Sign Out" onPress={handleSignOut} danger />
          </Card>
        </Animated.View>
          </>
        ) : null}
      </Animated.ScrollView>

      <BottomSheetModal
        visible={accountSheetVisible}
        title="Account Preferences"
        description="Adjust the mobile profile fields and analyst context shown throughout the app."
        onClose={() => setAccountSheetVisible(false)}
        footer={<Button label="Save preferences" onPress={handleSaveAccount} fullWidth />}
      >
        <Input
          label="Display Name"
          value={accountDraft.profileName}
          onChangeText={(value) => setAccountDraft((current) => ({ ...current, profileName: value }))}
          placeholder="Your display name"
        />
        <Input
          label="Contact Email"
          value={accountDraft.profileEmail}
          onChangeText={(value) => setAccountDraft((current) => ({ ...current, profileEmail: value }))}
          placeholder="name@company.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View>
          <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Persona
          </Text>
          <View style={styles.chipWrap}>
            {PERSONA_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={accountDraft.persona === option}
                onPress={() => setAccountDraft((current) => ({ ...current, persona: option }))}
              />
            ))}
          </View>
        </View>
        <Input
          label="Timezone"
          value={accountDraft.timezone}
          onChangeText={(value) => setAccountDraft((current) => ({ ...current, timezone: value }))}
          placeholder="Africa/Cairo"
        />
        <Input
          label="Language"
          value={accountDraft.language}
          onChangeText={(value) => setAccountDraft((current) => ({ ...current, language: value }))}
          placeholder="English"
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    flex: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.base,
  },
  heroBlock: {
    paddingTop: spacing.sm,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  stateWrap: {
    marginTop: spacing.base,
  },
  noticeText: {
    marginTop: spacing.base,
    textAlign: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.base,
  },
  pressed: {
    opacity: 0.8,
  },
});
