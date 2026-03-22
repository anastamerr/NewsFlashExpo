import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  title: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}

export function Section({ title, seeAllLabel = 'See all', onSeeAll, children }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typePresets.h2, { color: colors.text }]}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
            <Text style={[typePresets.label, { color: colors.primary }]}>
              {seeAllLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
