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
import { StateBlock } from '@/components/ui/StateBlock';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import { successNotification } from '@/utils/haptics';
import { normalizeTenantSlug } from '@/utils/tenantSlug';
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
          <Text style={[typePresets.labelXs, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
            {item.tenant_id}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textTertiary} strokeWidth={1.8} />
      </View>
    </Card>
  );
});

export function TenantSelectScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const tenants = useAuthStore((state) => state.tenants);
  const selectTenant = useAuthStore((state) => state.selectTenant);
  const createTenant = useAuthStore((state) => state.createTenant);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [query, setQuery] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantDescription, setTenantDescription] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [error, setError] = useState('');

  const canCreateTenant = user?.capabilities?.can_create_tenants ?? true;
  const filteredTenants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return tenants;
    }

    return tenants.filter((tenant) => (
      tenant.tenant_name.toLowerCase().includes(normalizedQuery) ||
      tenant.role.toLowerCase().includes(normalizedQuery) ||
      tenant.tenant_id.toLowerCase().includes(normalizedQuery)
    ));
  }, [query, tenants]);

  const handleSelect = useCallback(async (tenant: TenantOption) => {
    setError('');

    try {
      await selectTenant(tenant.tenant_id);
    } catch (err: any) {
      setError(err.message || 'Unable to open that workspace right now.');
    }
  }, [selectTenant]);

  const handleTenantNameChange = useCallback((value: string) => {
    setTenantName(value);

    if (!isSlugEdited) {
      setTenantSlug(normalizeTenantSlug(value));
    }
  }, [isSlugEdited]);

  const handleTenantSlugChange = useCallback((value: string) => {
    setIsSlugEdited(true);
    setTenantSlug(normalizeTenantSlug(value));
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setTenantName('');
    setTenantSlug('');
    setTenantDescription('');
    setIsSlugEdited(false);
    setError('');
  }, []);

  const handleCreateTenant = useCallback(async () => {
    const trimmedName = tenantName.trim();
    const normalizedSlug = normalizeTenantSlug(tenantSlug || tenantName);

    if (!trimmedName) {
      setError('Add a workspace name before creating it.');
      return;
    }

    if (!normalizedSlug) {
      setError('Workspace slug must contain letters or numbers.');
      return;
    }

    setError('');

    try {
      const createdTenant = await createTenant({
        name: trimmedName,
        slug: normalizedSlug,
        description: tenantDescription.trim() || undefined,
      });
      successNotification();
      handleCloseSheet();
      await selectTenant(createdTenant.tenant_id);
    } catch (err: any) {
      setError(err.message || 'Unable to create that workspace right now.');
    }
  }, [createTenant, handleCloseSheet, selectTenant, tenantDescription, tenantName, tenantSlug]);

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
        {canCreateTenant ? (
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
        ) : null}
      </Animated.View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search workspaces..."
      />

      {error ? (
        <View style={styles.feedbackWrap}>
          <StateBlock title="Workspace action failed" message={error} />
        </View>
      ) : null}
    </View>
  ), [canCreateTenant, colors.primary, colors.text, colors.textInverse, colors.textSecondary, error, query]);

  const listEmptyComponent = useMemo(() => {
    if (isLoading && tenants.length === 0) {
      return (
        <StateBlock
          title="Loading workspaces"
          message="Fetching the organizations available for this account."
          loading
        />
      );
    }

    if (tenants.length === 0) {
      return (
        <StateBlock
          title="No workspaces available"
          message={canCreateTenant ? 'Create the first workspace to finish onboarding.' : 'Your account does not have access to any workspaces yet.'}
          actionLabel={canCreateTenant ? 'Create Workspace' : undefined}
          onAction={canCreateTenant ? () => setSheetVisible(true) : undefined}
        />
      );
    }

    return (
      <StateBlock
        title="No matches found"
        message="Try a different workspace name, role, or slug."
      />
    );
  }, [canCreateTenant, isLoading, tenants.length]);

  return (
    <ScreenContainer scrollable={false}>
      <StatusBar style="light" />
      <FlashList
        data={filteredTenants}
        keyExtractor={(item) => item.tenant_id}
        renderItem={renderTenant}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheetModal
        visible={sheetVisible}
        title="Create Organization"
        description="Set up a new workspace without leaving mobile onboarding."
        onClose={handleCloseSheet}
        footer={<Button label="Create workspace" onPress={handleCreateTenant} loading={isLoading} fullWidth />}
      >
        <Input
          label="Workspace Name"
          placeholder="NewsFlash Research"
          value={tenantName}
          onChangeText={handleTenantNameChange}
        />
        <Input
          label="Workspace Slug"
          placeholder="newsflash-research"
          value={tenantSlug}
          onChangeText={handleTenantSlugChange}
          autoCapitalize="none"
          hint="Lowercase slug used for a clean workspace identifier."
        />
        <Input
          label="Description"
          placeholder="MENA macro and company intelligence"
          value={tenantDescription}
          onChangeText={setTenantDescription}
          multiline
        />
        {error ? (
          <Text style={[typePresets.bodySm, { color: colors.danger }]}>
            {error}
          </Text>
        ) : null}
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
    paddingBottom: spacing.xl,
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
  feedbackWrap: {
    marginTop: spacing.base,
  },
  pressed: {
    opacity: 0.8,
  },
});
