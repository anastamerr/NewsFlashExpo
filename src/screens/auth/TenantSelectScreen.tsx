import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { ChevronRight, Building2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import type { TenantOption } from '@/types/api';

export function TenantSelectScreen() {
  const { colors } = useTheme();
  const { tenants, selectTenant, isLoading } = useAuthStore();

  const handleSelect = useCallback(async (tenant: TenantOption) => {
    await selectTenant(tenant.tenant_id);
  }, [selectTenant]);

  const renderTenant = useCallback(({ item, index }: { item: TenantOption; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 80).springify().damping(15)}>
      <Card
        variant="elevated"
        onPress={() => handleSelect(item)}
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
    </Animated.View>
  ), [colors, handleSelect]);

  return (
    <ScreenContainer scrollable={false}>
      <StatusBar style="light" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={[typePresets.displaySm, { color: colors.text }]}>
          Select Organization
        </Text>
        <Text style={[typePresets.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          Choose a workspace to continue
        </Text>
      </Animated.View>

      <FlatList
        data={tenants}
        keyExtractor={(item) => item.tenant_id}
        renderItem={renderTenant}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
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
});
