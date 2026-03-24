import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ReportStateView({ isLoading, error, onRetry }: Props) {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[typePresets.body, { color: colors.textSecondary }]}>
          Loading report...
        </Text>
      </View>
    );
  }

  if (!error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[typePresets.h3, { color: colors.text }]}>Report unavailable</Text>
      <Text style={[typePresets.bodySm, styles.errorText, { color: colors.textSecondary }]}>
        {error}
      </Text>
      {onRetry ? (
        <View style={styles.buttonWrap}>
          <Button label="Try Again" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  errorText: {
    textAlign: 'center',
  },
  buttonWrap: {
    marginTop: spacing.sm,
    minWidth: 160,
  },
});
