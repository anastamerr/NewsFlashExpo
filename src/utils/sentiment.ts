import type { ThemeColors } from '@/theme/tokens';

export function getSentimentColor(
  sentiment: number | 'positive' | 'negative' | 'neutral',
  colors: ThemeColors,
): string {
  if (typeof sentiment === 'string') {
    switch (sentiment) {
      case 'positive': return colors.sentimentPositive;
      case 'negative': return colors.sentimentNegative;
      default: return colors.sentimentNeutral;
    }
  }
  if (sentiment > 1) return colors.sentimentPositive;
  if (sentiment < -1) return colors.sentimentNegative;
  return colors.sentimentNeutral;
}

export function getSentimentLabel(sentiment: number): 'positive' | 'negative' | 'neutral' {
  if (sentiment > 1) return 'positive';
  if (sentiment < -1) return 'negative';
  return 'neutral';
}
