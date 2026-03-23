import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Users'>;

const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'admin@newsflash.com', role: 'global-superuser', isActive: true },
  { id: '2', name: 'Sarah Johnson', email: 'tsu@newsflash.com', role: 'tenant-superuser', isActive: true },
  { id: '3', name: 'Mahmoud Hassan', email: 'mahmoud@newsflash.com', role: 'member', isActive: true },
  { id: '4', name: 'Layla Ahmed', email: 'layla@newsflash.com', role: 'member', isActive: false },
];

export function UsersScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingBottom: insets.bottom + spacing.xxl,
    }),
    [insets.bottom],
  );

  const renderUser = ({ item, index }: { item: typeof MOCK_USERS[0]; index: number }) => {
    const roleVariant = item.role.includes('superuser') ? 'primary' : 'neutral';
    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[typePresets.h3, { color: colors.primary }]}>
                {item.name[0]}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[typePresets.h3, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>{item.email}</Text>
              <View style={styles.roleBadge}>
                <Badge label={item.role.replace(/-/g, ' ')} variant={roleVariant} small />
              </View>
            </View>
            <Toggle value={item.isActive} onValueChange={() => {}} />
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={[typePresets.h3, { color: colors.text }]}>Users</Text>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <UserPlus size={18} color={colors.textInverse} strokeWidth={2} />
        </Pressable>
      </View>

      <FlashList
        data={MOCK_USERS}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={listContentContainerStyle}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  userCard: {
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.8,
  },
});
