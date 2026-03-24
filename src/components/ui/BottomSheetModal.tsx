import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, radius, shadows } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomSheetModal({
  visible,
  title,
  description,
  onClose,
  children,
  footer,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close sheet" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              paddingBottom: Math.max(insets.bottom, spacing.base),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[typePresets.h2, { color: colors.text }]}>{title}</Text>
              {description ? (
                <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                  {description}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <X size={18} color={colors.textSecondary} strokeWidth={2.2} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {children}
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderCurve: 'continuous',
    paddingTop: spacing.sm,
    ...shadows.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.full,
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.base,
    paddingHorizontal: spacing.base,
  },
  headerText: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.base,
    gap: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
