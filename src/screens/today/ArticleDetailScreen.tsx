import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, Share2, Bookmark } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Chip } from '@/components/ui/Chip';
import { SentimentBadge } from '@/components/data/SentimentBadge';
import { getSentimentColor } from '@/utils/sentiment';
import { formatDate, timeAgo } from '@/utils/format';
import { MOCK_ARTICLES } from '@/constants/mockData';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TodayStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<TodayStackParamList, 'ArticleDetail'>;

export function ArticleDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const article = MOCK_ARTICLES.find((a) => a.id === route.params.articleId) ?? MOCK_ARTICLES[0];

  const sentimentPercent = Math.min(Math.max(((article.sentiment + 5) / 10) * 100, 5), 95);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Bookmark size={20} color={colors.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Share2 size={20} color={colors.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {/* Source & Meta */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.meta}>
          <View style={[styles.sourceDot, { backgroundColor: colors.primary }]} />
          <Text style={[typePresets.label, { color: colors.textSecondary }]}>{article.source}</Text>
          <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
            {formatDate(article.date)} &middot; {timeAgo(article.date)}
          </Text>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[typePresets.displayMd, { color: colors.text, marginTop: spacing.md }]}>
            {article.title}
          </Text>
        </Animated.View>

        {/* Sentiment Bar */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.sentimentSection}>
          <View style={styles.sentimentHeader}>
            <Text style={[typePresets.label, { color: colors.textSecondary }]}>Sentiment Analysis</Text>
            <SentimentBadge value={article.sentiment} showValue />
          </View>
          <View style={[styles.sentimentTrack, { backgroundColor: colors.muted }]}>
            <Animated.View
              style={[
                styles.sentimentFill,
                {
                  width: `${sentimentPercent}%`,
                  backgroundColor: getSentimentColor(article.sentiment, colors),
                },
              ]}
            />
          </View>
          <View style={styles.sentimentScale}>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>-5</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>0</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>+5</Text>
          </View>
        </Animated.View>

        {/* Article Body */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[typePresets.articleBody, { color: colors.text, marginTop: spacing.xl }]}>
            {article.summary}
          </Text>
          <Text style={[typePresets.articleBody, { color: colors.text, marginTop: spacing.base }]}>
            Market analysts are closely watching developments as the situation continues to evolve. The implications for regional markets could be significant, with multiple sectors expected to feel the impact in the coming weeks.
          </Text>
          <Text style={[typePresets.articleBody, { color: colors.text, marginTop: spacing.base }]}>
            Industry experts suggest that investors should monitor related indicators and adjust portfolio positions accordingly. Further updates are expected as more information becomes available from official sources.
          </Text>
        </Animated.View>

        {/* Tags */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.tags}>
          {article.company && <Chip label={article.company} />}
          {article.tag && <Chip label={article.tag} />}
          {article.focusType && <Chip label={article.focusType} />}
        </Animated.View>

        {/* AI Summary */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <GlassCard style={styles.aiCard}>
            <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.sm }]}>
              AI SUMMARY
            </Text>
            <Text style={[typePresets.body, { color: colors.text }]}>
              This article covers a significant development in the {article.tag?.toLowerCase() || 'financial'} sector. Key takeaways include potential market volatility, sector-wide implications, and regulatory attention. Sentiment is {article.sentiment > 0 ? 'positive' : article.sentiment < 0 ? 'negative' : 'neutral'} with an importance rating of {article.importance}/10.
            </Text>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    paddingHorizontal: spacing.base,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sentimentSection: {
    marginTop: spacing.xl,
  },
  sentimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sentimentTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sentimentFill: {
    height: '100%',
    borderRadius: 3,
  },
  sentimentScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  aiCard: {
    marginTop: spacing.xl,
  },
});
