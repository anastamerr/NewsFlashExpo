import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Plus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { AlertRow } from '@/components/lists/AlertRow';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { FilterTrigger } from '@/components/ui/FilterTrigger';
import { OptionPickerSheet, type OptionPickerItem } from '@/components/ui/OptionPickerSheet';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_ALERTS, MOCK_ARTICLES } from '@/constants/mockData';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { SkeletonAlert } from '@/components/ui/Skeleton';
import {
  getStoredAlerts,
  saveStoredAlerts,
  type DeliveryChannel,
  type ManagedAlert,
  type SeverityFilter,
} from '@/utils/adminPersistence';
import { successNotification } from '@/utils/haptics';
import type { AlertPublic } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AlertsStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AlertsStackParamList, 'Alerts'>;
type AlertFilter = 'All' | 'Crisis' | 'Active' | 'Resolved';
type AlertTypeFilter = 'all' | NonNullable<AlertPublic['type']>;
type AlertDraft = {
  title: string;
  keywords: string;
  type: NonNullable<AlertPublic['type']>;
  severity: AlertPublic['severity'];
  companyFilters: string[];
  deliveryChannels: DeliveryChannel[];
  severityThreshold: SeverityFilter;
};

const FILTERS: AlertFilter[] = ['All', 'Crisis', 'Active', 'Resolved'];
const STATUS_SEGMENTS = FILTERS.map((filter) => ({ label: filter, value: filter }));
const ALERT_TYPE_FILTERS: { value: AlertTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'crisis', label: 'Crisis' },
  { value: 'macro', label: 'Macro' },
  { value: 'earnings', label: 'Earnings' },
  { value: 'brand_mention', label: 'Brand' },
];
const ALERT_TYPE_OPTIONS: OptionPickerItem[] = [
  { value: 'all', label: 'All Types', description: 'Show every alert rule and trigger.' },
  { value: 'crisis', label: 'Crisis', description: 'Focus on urgent reputation and incident signals.' },
  { value: 'macro', label: 'Macro', description: 'Surface rates, policy, and market environment alerts.' },
  { value: 'earnings', label: 'Earnings', description: 'Track financial events and earnings-linked coverage.' },
  { value: 'brand_mention', label: 'Brand', description: 'Limit the feed to brand and company mention alerts.' },
];
const ALERT_TYPES: NonNullable<AlertPublic['type']>[] = ['crisis', 'macro', 'earnings', 'brand_mention', 'ratings', 'ceo_change'];
const DELIVERY_CHANNELS: DeliveryChannel[] = ['push', 'email', 'in-app'];
const COMPANY_OPTIONS = Array.from(new Set(MOCK_ARTICLES.map((article) => article.company))).slice(0, 8);
const EMPTY_DRAFT: AlertDraft = {
  title: '',
  keywords: '',
  type: 'macro',
  severity: 'HIGH',
  companyFilters: [],
  deliveryChannels: ['push', 'in-app'],
  severityThreshold: 'HIGH',
};

const ALERT_COLORS: Record<AlertPublic['severity'], string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#8aa8ff',
};

export function AlertsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useScrollDirection();
  const parentNavigation = navigation.getParent();
  const [alerts, setAlerts] = useState<ManagedAlert[]>(MOCK_ALERTS);
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<AlertTypeFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [typeSheetVisible, setTypeSheetVisible] = useState(false);
  const [draft, setDraft] = useState<AlertDraft>(EMPTY_DRAFT);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getStoredAlerts(MOCK_ALERTS),
      new Promise((resolve) => setTimeout(resolve, 350)),
    ]).then(([storedAlerts]) => {
      if (!isMounted) {
        return;
      }

      setAlerts(storedAlerts);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    const storedAlerts = await getStoredAlerts(MOCK_ALERTS);
    setAlerts(storedAlerts);
  });

  const filteredAlerts = useMemo(() => {
    const statusFiltered = alerts.filter((alert) => {
      switch (activeFilter) {
        case 'Crisis':
          return alert.type === 'crisis' || alert.severity === 'CRITICAL';
        case 'Active':
          return !alert.isResolved;
        case 'Resolved':
          return alert.isResolved;
        default:
          return true;
      }
    });

    if (activeTypeFilter === 'all') {
      return statusFiltered;
    }

    return statusFiltered.filter((alert) => alert.type === activeTypeFilter);
  }, [activeFilter, activeTypeFilter, alerts]);

  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingBottom: insets.bottom + 90,
    }),
    [insets.bottom],
  );
  const activeTypeLabel = useMemo(
    () => ALERT_TYPE_FILTERS.find((filter) => filter.value === activeTypeFilter)?.label ?? 'All Types',
    [activeTypeFilter],
  );

  const handleAlertPress = useCallback((alert: AlertPublic) => {
    navigation.navigate('AlertDetail', { alertId: alert.id });
  }, [navigation]);

  const handleAlertLongPress = useCallback((alert: AlertPublic) => {
    if (alert.type === 'crisis') {
      navigation.navigate('CrisisDetail', { crisisId: alert.id });
      return;
    }

    navigation.navigate('AlertTriggerDetail', {
      alertId: alert.id,
      triggerId: alert.id,
    });
  }, [navigation]);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setDraft(EMPTY_DRAFT);
  }, []);

  const handleToggleCompany = useCallback((company: string) => {
    setDraft((current) => ({
      ...current,
      companyFilters: current.companyFilters.includes(company)
        ? current.companyFilters.filter((item) => item !== company)
        : [...current.companyFilters, company],
    }));
  }, []);

  const handleToggleChannel = useCallback((channel: DeliveryChannel) => {
    setDraft((current) => ({
      ...current,
      deliveryChannels: current.deliveryChannels.includes(channel)
        ? current.deliveryChannels.filter((item) => item !== channel)
        : [...current.deliveryChannels, channel],
    }));
  }, []);

  const handleCreateAlert = useCallback(async () => {
    const title = draft.title.trim();
    const keywords = draft.keywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (!title || keywords.length === 0) {
      return;
    }

    const scope = draft.companyFilters.length > 0 ? draft.companyFilters.join(', ') : 'the selected market';
    const nextAlert: ManagedAlert = {
      id: `alert-${Date.now()}`,
      title,
      severity: draft.severity,
      message: `Monitoring ${scope} for ${keywords.slice(0, 3).join(', ')} with ${draft.severityThreshold} escalation.`,
      keywords,
      source: 'Custom Rule',
      color: ALERT_COLORS[draft.severity],
      createdAt: new Date().toISOString(),
      isResolved: false,
      type: draft.type,
      companyFilters: draft.companyFilters,
      deliveryChannels: draft.deliveryChannels,
      severityThreshold: draft.severityThreshold,
    };

    const nextAlerts = [nextAlert, ...alerts];
    setAlerts(nextAlerts);
    await saveStoredAlerts(nextAlerts);
    successNotification();
    handleCloseSheet();
  }, [alerts, draft, handleCloseSheet]);

  const renderAlert = useCallback(({ item, index }: { item: ManagedAlert; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <AlertRow alert={item} onPress={handleAlertPress} onLongPress={handleAlertLongPress} />
    </Animated.View>
  ), [handleAlertLongPress, handleAlertPress]);

  const activeCount = alerts.filter((alert) => !alert.isResolved).length;
  const criticalCount = alerts.filter((alert) => alert.severity === 'CRITICAL' && !alert.isResolved).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={[typePresets.h1, { color: colors.text }]}>Alerts</Text>
          <Text style={[typePresets.bodySm, { color: colors.textTertiary, marginTop: 2 }]}>
            {activeCount} active{criticalCount > 0 ? ` | ${criticalCount} critical` : ''}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setSheetVisible(true)}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Create alert"
          >
            <Plus size={20} color={colors.textInverse} strokeWidth={2.5} />
          </Pressable>
          <Pressable
            onPress={() => parentNavigation?.goBack()}
            style={({ pressed }) => [
              styles.dismissBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close alerts"
          >
            <X size={18} color={colors.textSecondary} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.controls}>
        <SegmentedControl
          options={STATUS_SEGMENTS}
          value={activeFilter}
          onChange={(value) => setActiveFilter(value as AlertFilter)}
        />
        <View style={styles.metaRow}>
          <View style={styles.metaTrigger}>
            <FilterTrigger
              label="Type"
              value={activeTypeLabel}
              onPress={() => setTypeSheetVisible(true)}
            />
          </View>
          <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
            {filteredAlerts.length} showing
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonAlert key={index} />
          ))}
        </View>
      ) : (
        <FlashList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          contentContainerStyle={listContentContainerStyle}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <BottomSheetModal
        visible={sheetVisible}
        title="Create Alert Rule"
        description="Define scope, delivery, and escalation without leaving the mobile workflow."
        onClose={handleCloseSheet}
        footer={<Button label="Create alert" onPress={handleCreateAlert} fullWidth />}
      >
        <Input
          label="Rule Title"
          placeholder="CBE liquidity watch"
          value={draft.title}
          onChangeText={(value) => setDraft((current) => ({ ...current, title: value }))}
        />
        <Input
          label="Keywords"
          placeholder="CBE, liquidity, rates"
          value={draft.keywords}
          onChangeText={(value) => setDraft((current) => ({ ...current, keywords: value }))}
          hint="Separate keywords with commas."
        />

        <View>
          <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Alert Type
          </Text>
          <View style={styles.sheetChips}>
            {ALERT_TYPES.map((type) => (
              <Chip
                key={type}
                label={type.replace(/_/g, ' ')}
                selected={draft.type === type}
                onPress={() => setDraft((current) => ({ ...current, type }))}
              />
            ))}
          </View>
        </View>

        <View>
          <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Severity Threshold
          </Text>
          <View style={styles.sheetChips}>
            {SEVERITY_OPTIONS.map((severity) => (
              <Chip
                key={severity}
                label={severity}
                selected={draft.severityThreshold === severity}
                onPress={() => setDraft((current) => ({ ...current, severityThreshold: severity, severity }))}
              />
            ))}
          </View>
        </View>

        <View>
          <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Company Filters
          </Text>
          <View style={styles.sheetChips}>
            {COMPANY_OPTIONS.map((company) => (
              <Chip
                key={company}
                label={company}
                selected={draft.companyFilters.includes(company)}
                onPress={() => handleToggleCompany(company)}
              />
            ))}
          </View>
        </View>

        <View>
          <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Delivery Channels
          </Text>
          <View style={styles.sheetChips}>
            {DELIVERY_CHANNELS.map((channel) => (
              <Chip
                key={channel}
                label={channel}
                selected={draft.deliveryChannels.includes(channel)}
                onPress={() => handleToggleChannel(channel)}
              />
            ))}
          </View>
        </View>
      </BottomSheetModal>

      <OptionPickerSheet
        visible={typeSheetVisible}
        title="Alert Type"
        description="Narrow the feed without adding another chip row."
        value={activeTypeFilter}
        options={ALERT_TYPE_OPTIONS}
        onClose={() => setTypeSheetVisible(false)}
        onSelect={(value) => setActiveTypeFilter(value as AlertTypeFilter)}
      />
    </View>
  );
}

const SEVERITY_OPTIONS: SeverityFilter[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metaTrigger: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  sheetChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
