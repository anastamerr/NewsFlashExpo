import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { spacing } from '@/theme';

interface Props {
  tags: string[];
  onTagPress?: (tag: string) => void;
}

export function BadgeStrip({ tags, onTagPress }: Props) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <Chip key={tag} label={tag} onPress={onTagPress ? () => onTagPress(tag) : undefined} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
