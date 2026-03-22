import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { getSentimentLabel } from '@/utils/sentiment';
import { formatSentiment } from '@/utils/format';

interface Props {
  value: number;
  showValue?: boolean;
  small?: boolean;
}

export function SentimentBadge({ value, showValue = false, small = false }: Props) {
  const label = getSentimentLabel(value);
  const variant = label === 'positive' ? 'success' : label === 'negative' ? 'danger' : 'warning';
  const displayLabel = showValue ? `${label} (${formatSentiment(value)})` : label;

  return <Badge label={displayLabel} variant={variant} dot small={small} />;
}
