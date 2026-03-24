import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  title: string;
  body: string;
}

export function SectionBlock({ title, body }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typePresets.h2, { color: colors.text }]}>{title}</Text>
      <Text style={[typePresets.articleBody, { color: colors.text, marginTop: spacing.sm }]}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
});
