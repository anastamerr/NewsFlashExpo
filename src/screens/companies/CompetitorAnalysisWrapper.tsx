import React from 'react';
import { CompetitorAnalysisScreen } from './CompetitorAnalysisScreen';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ResearchStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<ResearchStackParamList, 'CompetitorAnalysis'>;

export function CompetitorAnalysisWrapper({ route, navigation }: Props) {
  return (
    <CompetitorAnalysisScreen
      companyAId={route.params?.companyAId}
      companyBId={route.params?.companyBId}
      onBack={() => navigation.goBack()}
      showHeader
    />
  );
}
