import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  title: string;
  message?: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function StateBlock({
  title,
  message,
  loading = false,
  actionLabel,
  onAction,
}: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      <Text style={[typePresets.h3, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[typePresets.bodySm, styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.actionWrap}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
  },
  actionWrap: {
    marginTop: spacing.sm,
    minWidth: 160,
  },
});
