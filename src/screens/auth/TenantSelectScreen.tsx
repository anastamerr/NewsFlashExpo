import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { ChevronRight, Building2, Plus } from 'lucide-react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import { successNotification } from '@/utils/haptics';
import type { TenantOption } from '@/types/api';

const TenantCardItem = memo(function TenantCardItem({
  item,
  onSelectTenant,
}: {
  item: TenantOption;
  onSelectTenant: (tenant: TenantOption) => void;
}) {
  const { colors } = useTheme();
  const handlePress = useCallback(() => {
    onSelectTenant(item);
  }, [item, onSelectTenant]);

  return (
    <Card
      variant="elevated"
      onPress={handlePress}
      style={styles.tenantCard}
    >
      <View style={styles.tenantRow}>
        <View style={[styles.tenantIcon, { backgroundColor: colors.primary + '15' }]}>
          <Building2 size={22} color={colors.primary} strokeWidth={1.8} />
        </View>
        <View style={styles.tenantInfo}>
          <Text style={[typePresets.h3, { color: colors.text }]}>{item.tenant_name}</Text>
          <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
            {item.role.replace(/-/g, ' ')}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textTertiary} strokeWidth={1.8} />
      </View>
    </Card>
  );
});

export function TenantSelectScreen() {
  const { colors } = useTheme();
  const tenants = useAuthStore((state) => state.tenants);
  const selectTenant = useAuthStore((state) => state.selectTenant);
  const createTenant = useAuthStore((state) => state.createTenant);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [query, setQuery] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantDescription, setTenantDescription] = useState('');

  const filteredTenants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return tenants;
    }

    return tenants.filter((tenant) => (
      tenant.tenant_name.toLowerCase().includes(normalizedQuery) ||
      tenant.role.toLowerCase().includes(normalizedQuery)
    ));
  }, [query, tenants]);

  const handleSelect = useCallback(async (tenant: TenantOption) => {
    await selectTenant(tenant.tenant_id);
  }, [selectTenant]);

  const handleCreateTenant = useCallback(async () => {
    if (!tenantName.trim()) {
      return;
    }

    const createdTenant = await createTenant({
      name: tenantName.trim(),
      description: tenantDescription.trim() || undefined,
    });
    successNotification();
    setSheetVisible(false);
    setTenantName('');
    setTenantDescription('');
    await selectTenant(createdTenant.tenant_id);
  }, [createTenant, selectTenant, tenantDescription, tenantName]);

  const renderTenant = useCallback<ListRenderItem<TenantOption>>(({ item, index }) => (
    <Animated.View entering={FadeInRight.delay(index * 80).springify().damping(15)}>
      <TenantCardItem item={item} onSelectTenant={handleSelect} />
    </Animated.View>
  ), [handleSelect]);

  const listHeader = useMemo(() => (
    <View>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[typePresets.displaySm, { color: colors.text }]}>
            Select Organization
          </Text>
          <Text style={[typePresets.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Choose a workspace to continue or create a new one if you need a separate operating environment.
          </Text>
        </View>
        <Pressable
          onPress={() => setSheetVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Create organization"
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Plus size={18} color={colors.textInverse} strokeWidth={2} />
        </Pressable>
      </Animated.View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search workspaces..."
      />
    </View>
  ), [colors.primary, colors.text, colors.textInverse, colors.textSecondary, query]);

  return (
    <ScreenContainer scrollable={false}>
      <StatusBar style="light" />
      <FlashList
        data={filteredTenants}
        keyExtractor={(item) => item.tenant_id}
        renderItem={renderTenant}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheetModal
        visible={sheetVisible}
        title="Create Organization"
        description="Set up a new workspace without leaving mobile onboarding."
        onClose={() => setSheetVisible(false)}
        footer={<Button label="Create workspace" onPress={handleCreateTenant} loading={isLoading} fullWidth />}
      >
        <Input
          label="Workspace Name"
          placeholder="NewsFlash Research"
          value={tenantName}
          onChangeText={setTenantName}
        />
        <Input
          label="Description"
          placeholder="MENA macro and company intelligence"
          value={tenantDescription}
          onChangeText={setTenantDescription}
          multiline
        />
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    gap: spacing.base,
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  tenantCard: {
    marginBottom: 0,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tenantInfo: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
