import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwipeTabs } from '@/components/layout/SwipeTabs';
import { CompaniesScreen } from './CompaniesScreen';
import { CompetitorAnalysisScreen } from './CompetitorAnalysisScreen';

const TABS = [
  { key: 'Companies', label: 'Companies', content: <CompaniesScreen /> },
  { key: 'Compare', label: 'Compare', content: <CompetitorAnalysisScreen /> },
] as const;

export function ResearchHomeScreen() {
  const insets = useSafeAreaInsets();

  return <SwipeTabs tabs={TABS} topInset={insets.top} />;
}
