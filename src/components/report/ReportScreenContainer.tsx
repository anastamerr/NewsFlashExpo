import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing } from '@/theme';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { ReportHeader } from './ReportHeader';
import { ReportCTARow } from './ReportCTARow';

interface CTAAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface Props {
  children: React.ReactNode;
  title: string;
  onBack: () => void;
  onShare?: () => void;
  onChat?: () => void;
  ctaActions?: CTAAction[];
}

export function ReportScreenContainer({
  children,
  title,
  onBack,
  onShare,
  onChat,
  ctaActions,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useScrollDirection();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ReportHeader title={title} onBack={onBack} onShare={onShare} onChat={onChat} />
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: ctaActions?.length
              ? spacing.xl
              : insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      {ctaActions && ctaActions.length > 0 && (
        <ReportCTARow actions={ctaActions} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
  },
});
