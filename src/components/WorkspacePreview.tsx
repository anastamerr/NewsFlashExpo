import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { palette, radii, shadows, spacing, typography } from '../theme/tokens';

export interface PreviewMetric {
  label: string;
  tone: 'emerald' | 'cobalt' | 'amber' | 'rose';
  value: string;
}

export interface PreviewSection {
  eyebrow: string;
  items: string[];
  title: string;
}

interface WorkspacePreviewProps {
  actions?: ReactNode;
  description: string;
  metrics: PreviewMetric[];
  sections: PreviewSection[];
  title: string;
}

const toneStyles = {
  amber: {
    backgroundColor: palette.amberSoft,
    color: palette.amber,
  },
  cobalt: {
    backgroundColor: palette.cobaltSoft,
    color: palette.cobalt,
  },
  emerald: {
    backgroundColor: palette.emeraldSoft,
    color: palette.emerald,
  },
  rose: {
    backgroundColor: palette.roseSoft,
    color: palette.rose,
  },
} as const;

export function WorkspacePreview({
  actions,
  description,
  metrics,
  sections,
  title,
}: WorkspacePreviewProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.kicker}>MOBILE WORKSPACE</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.metricRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {metrics.map((metric) => {
          const tone = toneStyles[metric.tone];
          return (
            <View key={metric.label} style={[styles.metricCard, { backgroundColor: tone.backgroundColor }]}>
              <Text style={[styles.metricLabel, { color: tone.color }]}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          );
        })}
      </ScrollView>

      {sections.map((section) => (
        <View key={section.title} style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>{section.eyebrow}</Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.itemList}>
            {section.items.map((item) => (
              <View key={item} style={styles.itemRow}>
                <View style={styles.itemBullet} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  content: {
    backgroundColor: palette.background,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  description: {
    color: palette.panelAlt,
    fontFamily: typography.serif,
    fontSize: 18,
    lineHeight: 26,
    marginTop: spacing.sm,
  },
  hero: {
    backgroundColor: palette.canvas,
    borderRadius: radii.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.soft,
  },
  itemBullet: {
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    height: 8,
    marginTop: 7,
    width: 8,
  },
  itemList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemText: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.serif,
    fontSize: 17,
    lineHeight: 23,
  },
  kicker: {
    color: '#a9b39d',
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 2,
  },
  metricCard: {
    borderRadius: radii.md,
    minHeight: 120,
    padding: spacing.md,
    width: 152,
  },
  metricLabel: {
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  metricRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  metricValue: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 29,
    marginTop: spacing.md,
  },
  sectionCard: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.soft,
  },
  sectionEyebrow: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 26,
    marginTop: spacing.xs,
  },
  title: {
    color: palette.white,
    fontFamily: typography.serifBold,
    fontSize: 38,
    marginTop: spacing.sm,
  },
});
