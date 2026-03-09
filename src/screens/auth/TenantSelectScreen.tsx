import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '../../store/session';
import { palette, radii, shadows, spacing, typography } from '../../theme/tokens';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function TenantSelectScreen() {
  const { capabilities, createTenant, isBusy, selectTenant, signOut, tenants, user } = useSession();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(
    () => `${tenants.length} workspace${tenants.length === 1 ? '' : 's'} available`,
    [tenants.length],
  );

  async function handleCreateTenant() {
    const nextName = name.trim();
    const nextSlug = slugify(slug || name);

    if (!nextName || !nextSlug) {
      setError('Tenant name and slug are required.');
      return;
    }

    setError(null);

    try {
      await createTenant({ name: nextName, slug: nextSlug });
    } catch (tenantError) {
      setError(tenantError instanceof Error ? tenantError.message : 'Unable to create tenant');
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>TENANT ROUTING</Text>
          <Text style={styles.heroTitle}>Select a tenant</Text>
          <Text style={styles.heroCopy}>
            Choose the workspace you want to monitor or create a new tenant before entering the
            mobile shell.
          </Text>
          <Text style={styles.heroMeta}>{summary}</Text>
        </View>

        {capabilities.canCreateTenant ? (
          <View style={styles.panel}>
            <Text style={styles.panelEyebrow}>CREATE TENANT</Text>
            <Text style={styles.panelTitle}>New workspace</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                onChangeText={(value) => {
                  setName(value);
                  if (!slug) {
                    setSlug(slugify(value));
                  }
                }}
                placeholder="MENA Desk"
                placeholderTextColor={palette.inkSoft}
                style={styles.input}
                value={name}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Slug</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={(value) => setSlug(slugify(value))}
                placeholder="mena-desk"
                placeholderTextColor={palette.inkSoft}
                style={styles.input}
                value={slug}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable onPress={handleCreateTenant} style={styles.primaryButton}>
              {isBusy ? (
                <ActivityIndicator color={palette.canvas} />
              ) : (
                <Text style={styles.primaryButtonLabel}>Create and Enter</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.panelEyebrow}>WORKSPACE ACCESS</Text>
            <Text style={styles.panelTitle}>Tenant assignment required</Text>
            <Text style={styles.panelCopy}>
              Your account can enter existing tenants you belong to, but tenant creation is reserved
              for global superusers.
            </Text>
          </View>
        )}

        <View style={styles.panel}>
          <Text style={styles.panelEyebrow}>AVAILABLE TENANTS</Text>
          <Text style={styles.panelTitle}>Your workspaces</Text>
          <Text style={styles.panelCopy}>{user?.email ?? 'Authenticated user'}</Text>

          <View style={styles.tenantList}>
            {tenants.map((tenant) => (
              <Pressable key={tenant.id} onPress={() => void selectTenant(tenant.id)} style={styles.tenantCard}>
                <View style={styles.tenantHeader}>
                  <Text style={styles.tenantName}>{tenant.name}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeLabel}>{tenant.role.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text style={styles.tenantSlug}>{tenant.slug}</Text>
              </Pressable>
            ))}

            {tenants.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tenant memberships are available yet.</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable onPress={() => void signOut()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonLabel}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  emptyState: {
    borderColor: palette.line,
    borderRadius: radii.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: spacing.lg,
  },
  emptyStateText: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 17,
    lineHeight: 24,
  },
  error: {
    color: palette.rose,
    fontFamily: typography.mono,
    fontSize: 15,
    marginTop: spacing.sm,
  },
  fieldGroup: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  hero: {
    backgroundColor: palette.canvasMuted,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  heroCopy: {
    color: '#a9b0bc',
    fontFamily: typography.serif,
    fontSize: 18,
    lineHeight: 26,
    marginTop: spacing.sm,
  },
  heroEyebrow: {
    color: palette.emerald,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 1.6,
  },
  heroMeta: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 15,
    marginTop: spacing.lg,
  },
  heroTitle: {
    color: palette.white,
    fontFamily: typography.serifBold,
    fontSize: 38,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.lineStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    color: palette.ink,
    fontFamily: typography.mono,
    fontSize: 17,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  label: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 1,
  },
  panel: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.soft,
  },
  panelCopy: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 17,
    marginTop: spacing.xs,
  },
  panelEyebrow: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  panelTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 30,
    marginTop: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 52,
    marginTop: spacing.lg,
  },
  primaryButtonLabel: {
    color: palette.canvas,
    fontFamily: typography.monoBold,
    fontSize: 16,
    letterSpacing: 1,
  },
  roleBadge: {
    backgroundColor: palette.cobaltSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roleBadgeLabel: {
    color: palette.cobalt,
    fontFamily: typography.monoBold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: palette.lineStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryButtonLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 15,
    letterSpacing: 1,
  },
  tenantCard: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  tenantHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tenantList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  tenantName: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: 24,
    marginRight: spacing.md,
  },
  tenantSlug: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 14,
    marginTop: spacing.sm,
  },
});
