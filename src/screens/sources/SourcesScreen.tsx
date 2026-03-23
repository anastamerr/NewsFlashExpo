import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Globe } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_SOURCES } from '@/constants/mockData';
import type { Source } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Sources'>;

export function SourcesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingBottom: insets.bottom + spacing.xxl,
    }),
    [insets.bottom],
  );

  const renderSource = ({ item, index }: { item: Source; index: number }) => {
    const reliabilityVariant = item.reliability === 'high' ? 'success' : item.reliability === 'medium' ? 'warning' : 'danger';
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <Card style={styles.sourceCard}>
          <View style={styles.sourceHeader}>
            <View style={[styles.sourceIcon, { backgroundColor: colors.primary + '15' }]}>
              <Globe size={20} color={colors.primary} strokeWidth={1.8} />
            </View>
            <View style={styles.sourceInfo}>
              <Text style={[typePresets.h3, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>{item.category}</Text>
            </View>
            <Toggle value={item.enabled} onValueChange={() => {}} />
          </View>
          <View style={styles.sourceMeta}>
            <Badge label={item.reliability} variant={reliabilityVariant} small />
            <Text style={[typePresets.monoSm, { color: colors.textSecondary }]}>
              {item.articlesPerDay} articles/day
            </Text>
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
        <Text style={[typePresets.h3, { color: colors.text }]}>Content Sources</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlashList
        data={MOCK_SOURCES}
        keyExtractor={(item) => item.id}
        renderItem={renderSource}
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
  list: {
    paddingHorizontal: spacing.base,
  },
  sourceCard: {
    marginBottom: spacing.sm,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingLeft: spacing.xxxl + spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
