import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  X, User, Palette, Bell, Radio, Users, Info, LogOut,
  ChevronRight, Sun, Moon, Monitor,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  danger,
  rightElement,
}: {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
      style={styles.settingsRow}
    >
      <Icon size={20} color={danger ? colors.danger : colors.textSecondary} strokeWidth={1.8} />
      <Text style={[typePresets.body, { color: danger ? colors.danger : colors.text, flex: 1 }]}>
        {label}
      </Text>
      {value && (
        <Text style={[typePresets.bodySm, { color: colors.textTertiary, marginRight: spacing.sm }]}>
          {value}
        </Text>
      )}
      {rightElement}
      {onPress && !rightElement && <ChevronRight size={18} color={colors.textTertiary} strokeWidth={1.8} />}
    </TouchableOpacity>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { colors, mode, setMode, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Settings</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close settings">
          <X size={22} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {/* Profile */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>PROFILE</Text>
          <Card>
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[typePresets.h2, { color: colors.primary }]}>
                  {(user?.name?.[0] || 'U').toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[typePresets.h3, { color: colors.text }]}>{user?.name || 'User'}</Text>
                <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
                <Text style={[typePresets.labelSm, { color: colors.primary, marginTop: 2 }]}>
                  {user?.persona || 'Asset Manager'}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>APPEARANCE</Text>
          <Card>
            <View style={styles.themeRow}>
              {[
                { key: 'light' as const, label: 'Light', Icon: Sun },
                { key: 'dark' as const, label: 'Dark', Icon: Moon },
                { key: 'system' as const, label: 'System', Icon: Monitor },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setMode(opt.key)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${opt.label} theme`}
                  accessibilityState={{ selected: mode === opt.key }}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: mode === opt.key ? colors.primary + '20' : colors.muted,
                      borderColor: mode === opt.key ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <opt.Icon size={18} color={mode === opt.key ? colors.primary : colors.textSecondary} strokeWidth={2} />
                  <Text style={[typePresets.labelSm, { color: mode === opt.key ? colors.primary : colors.textSecondary }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>NOTIFICATIONS</Text>
          <Card>
            <SettingsRow icon={Bell} label="Push Notifications" rightElement={<Toggle value={true} onValueChange={() => {}} />} />
            <SettingsRow icon={Bell} label="Crisis Alerts" rightElement={<Toggle value={true} onValueChange={() => {}} />} />
            <SettingsRow icon={Bell} label="Daily Digest" rightElement={<Toggle value={false} onValueChange={() => {}} />} />
          </Card>
        </Animated.View>

        {/* Navigation */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>DATA</Text>
          <Card>
            <SettingsRow icon={Radio} label="Content Sources" onPress={() => navigation.navigate('Sources')} />
            {user?.capabilities?.can_manage_users && (
              <SettingsRow icon={Users} label="User Management" onPress={() => navigation.navigate('Users')} />
            )}
          </Card>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Text style={[typePresets.labelXs, styles.sectionLabel, { color: colors.textTertiary }]}>ABOUT</Text>
          <Card>
            <SettingsRow icon={Info} label="App Version" value="1.0.0" />
          </Card>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Card style={{ marginTop: spacing.xl }}>
            <SettingsRow icon={LogOut} label="Sign Out" onPress={handleSignOut} danger />
          </Card>
        </Animated.View>
      </ScrollView>
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
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.base,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
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
    borderWidth: 1.5,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
});
