import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SwipeTabs } from '@/components/layout/SwipeTabs';
import { WatchlistScreen } from '@/screens/watchlist/WatchlistScreen';
import type { BrowseStackParamList } from '@/types/navigation';
import { BrowseScreen } from './BrowseScreen';

type Props = NativeStackScreenProps<BrowseStackParamList, 'BrowseHome'>;

const TABS = [
  { key: 'Browse', label: 'Browse', content: <BrowseScreen /> },
  { key: 'Watchlist', label: 'Watchlist', content: <WatchlistScreen /> },
] as const;

export function BrowseHomeScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const requestedTab = route.params?.initialTab;

  useEffect(() => {
    if (requestedTab) {
      navigation.setParams({ initialTab: undefined });
    }
  }, [navigation, requestedTab]);

  return (
    <SwipeTabs
      tabs={TABS}
      requestedTab={requestedTab}
      topInset={insets.top}
    />
  );
}
