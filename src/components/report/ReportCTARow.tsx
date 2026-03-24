import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing } from '@/theme';
import { Button } from '@/components/ui/Button';

interface CTAAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface Props {
  actions: CTAAction[];
}

export function ReportCTARow({ actions }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (actions.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.borderSubtle,
          paddingBottom: insets.bottom + spacing.sm,
        },
      ]}
    >
      {actions.map((action, i) => (
        <View key={i} style={styles.button}>
          <Button
            label={action.label}
            onPress={action.onPress}
            variant={action.variant ?? (i === 0 ? 'primary' : 'secondary')}
            fullWidth
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
  },
});
