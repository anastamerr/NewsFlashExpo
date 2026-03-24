import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, AlertTriangle, Clock, Radio, Tag, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { SentimentGauge } from '@/components/charts/SentimentGauge';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { formatDate, timeAgo } from '@/utils/format';
import { MOCK_ALERTS, MOCK_ARTICLES } from '@/constants/mockData';
import { getStoredAlerts, saveStoredAlerts, type ManagedAlert } from '@/utils/adminPersistence';
import { successNotification } from '@/utils/haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AlertsStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AlertsStackParamList, 'AlertDetail'>;

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#8aa8ff',
};

function getFallbackAlert(alertId: string) {
  return (MOCK_ALERTS.find((alert) => alert.id === alertId) ?? MOCK_ALERTS[0]) as ManagedAlert;
}

export function AlertDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [alert, setAlert] = useState<ManagedAlert>(() => getFallbackAlert(route.params.alertId));
  const severityColor = SEVERITY_COLORS[alert.severity] ?? colors.primary;
  const relatedArticles = useMemo(() => MOCK_ARTICLES.slice(0, 3), []);

  useEffect(() => {
    let isMounted = true;

    getStoredAlerts(MOCK_ALERTS).then((storedAlerts) => {
      if (!isMounted) {
        return;
      }

      setAlert((storedAlerts.find((item) => item.id === route.params.alertId) ?? getFallbackAlert(route.params.alertId)) as ManagedAlert);
    });

    return () => {
      isMounted = false;
    };
  }, [route.params.alertId]);

  const handleOpenReport = useCallback(() => {
    if (alert.type === 'crisis') {
      navigation.navigate('CrisisDetail', { crisisId: alert.id });
      return;
    }

    navigation.navigate('AlertTriggerDetail', {
      alertId: alert.id,
      triggerId: alert.id,
    });
  }, [alert.id, alert.type, navigation]);

  const handleResolve = useCallback(async () => {
    const storedAlerts = await getStoredAlerts(MOCK_ALERTS);
    const nextAlerts = storedAlerts.map((item) => (
      item.id === alert.id ? { ...item, isResolved: true } : item
    ));

    await saveStoredAlerts(nextAlerts);
    setAlert((current) => ({ ...current, isResolved: true }));
    successNotification();
  }, [alert.id]);

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
        <Text style={[typePresets.h3, { color: colors.text }]}>Alert Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Pressable
            onPress={handleOpenReport}
            accessibilityRole="button"
            accessibilityLabel={`Open detailed report for ${alert.title}`}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <GlassCard style={{ borderLeftWidth: 4, borderLeftColor: severityColor }}>
              <View style={styles.severityHeader}>
                <AlertTriangle size={20} color={severityColor} strokeWidth={2} />
                <Badge
                  label={alert.severity}
                  variant={alert.severity === 'CRITICAL' ? 'danger' : alert.severity === 'HIGH' ? 'warning' : 'primary'}
                />
                {alert.isResolved ? <Badge label="Resolved" variant="success" dot /> : null}
              </View>
              <Text style={[typePresets.displaySm, { color: colors.text, marginTop: spacing.md }]}>
                {alert.title}
              </Text>
              <Text style={[typePresets.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                {alert.message}
              </Text>
            </GlassCard>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Clock size={16} color={colors.textTertiary} strokeWidth={2} />
              <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
                {formatDate(alert.createdAt)} ({timeAgo(alert.createdAt)})
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Radio size={16} color={colors.textTertiary} strokeWidth={2} />
              <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
                Source: {alert.source}
              </Text>
            </View>
            {alert.type ? (
              <View style={styles.metaRow}>
                <Tag size={16} color={colors.textTertiary} strokeWidth={2} />
                <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
                  Type: {alert.type.replace(/_/g, ' ')}
                </Text>
              </View>
            ) : null}
            {alert.deliveryChannels?.length ? (
              <View style={styles.metaRow}>
                <Radio size={16} color={colors.textTertiary} strokeWidth={2} />
                <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
                  Delivery: {alert.deliveryChannels.join(', ')}
                </Text>
              </View>
            ) : null}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Keywords
          </Text>
          <View style={styles.keywordsRow}>
            {alert.keywords.map((keyword) => (
              <Chip key={keyword} label={keyword} />
            ))}
          </View>
          {alert.companyFilters?.length ? (
            <>
              <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
                Company Scope
              </Text>
              <View style={styles.keywordsRow}>
                {alert.companyFilters.map((company) => (
                  <Chip key={company} label={company} selected />
                ))}
              </View>
            </>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Sentiment Impact
          </Text>
          <Card>
            <SentimentGauge
              positive={alert.severity === 'LOW' ? 60 : 20}
              neutral={30}
              negative={alert.severity === 'CRITICAL' ? 60 : 20}
              height={10}
            />
          </Card>
        </Animated.View>

        {!alert.isResolved ? (
          <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.actions}>
            <Button
              label="Mark as Resolved"
              onPress={handleResolve}
              variant="primary"
              fullWidth
              icon={<CheckCircle size={18} color={colors.textInverse} strokeWidth={2} />}
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Related Articles
          </Text>
          {relatedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={(selectedArticle) => navigation.navigate('ArticleDetail', { articleId: selectedArticle.id })}
            />
          ))}
        </Animated.View>
      </ScrollView>
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
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.base,
  },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaCard: {
    marginTop: spacing.base,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    marginTop: spacing.xl,
  },
  pressed: {
    opacity: 0.8,
  },
});
