import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createAlert,
  deleteAlert,
  listAlerts,
  runEmailAlerts,
} from '../../services/api/newsflash';
import { useSession } from '../../store/session';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import type {
  AlertChannel,
  AlertCreateInput,
  AlertPublic,
  AlertSentiment,
  EntityType,
  RunEmailAlertsResponse,
} from '../../types/api';

/* ────────────────────────────────────────────────────── */
/*  Constants                                             */
/* ────────────────────────────────────────────────────── */

type EngineRunItem = RunEmailAlertsResponse & {
  id: string;
  ran_at: string;
};

const entityTypeOptions: EntityType[] = ['company', 'market', 'person'];
const sentimentOptions: AlertSentiment[] = ['any', 'positive', 'neutral', 'negative'];
const channelOptions: AlertChannel[] = ['email', 'in_app', 'sms'];

const ENTITY_ICONS: Record<EntityType, keyof typeof Ionicons.glyphMap> = {
  company: 'business-outline',
  market: 'trending-up-outline',
  person: 'person-outline',
};

const SENTIMENT_ICONS: Record<AlertSentiment, keyof typeof Ionicons.glyphMap> = {
  any: 'swap-horizontal-outline',
  positive: 'arrow-up-outline',
  neutral: 'remove-outline',
  negative: 'arrow-down-outline',
};

const CHANNEL_ICONS: Record<AlertChannel, keyof typeof Ionicons.glyphMap> = {
  email: 'mail-outline',
  in_app: 'phone-portrait-outline',
  sms: 'chatbubble-outline',
};

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

/* ────────────────────────────────────────────────────── */
/*  Helpers                                               */
/* ────────────────────────────────────────────────────── */

function formatCreatedAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown time';
  return shortDateFormatter.format(parsed);
}

function formatOptionLabel(value: string) {
  return value.replace('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

/* ────────────────────────────────────────────────────── */
/*  Main Screen                                           */
/* ────────────────────────────────────────────────────── */

export function AlertsScreen() {
  const { selectedTenantId, token } = useSession();
  const [alerts, setAlerts] = useState<AlertPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const [engineRuns, setEngineRuns] = useState<EngineRunItem[]>([]);

  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('company');
  const [sentiment, setSentiment] = useState<AlertSentiment>('any');
  const [channel, setChannel] = useState<AlertChannel>('email');
  const [minImportance, setMinImportance] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [limitPerAlert, setLimitPerAlert] = useState('5');

  /* ── input focus tracking ── */
  const [entityFocused, setEntityFocused] = useState(false);
  const [importanceFocused, setImportanceFocused] = useState(false);
  const [limitFocused, setLimitFocused] = useState(false);

  /* ── entrance animations ── */
  const heroAnim = useRef(new Animated.Value(0)).current;
  const rulesAnim = useRef(new Animated.Value(0)).current;
  const engineAnim = useRef(new Animated.Value(0)).current;
  const triggersAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(rulesAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(engineAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(triggersAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [selectedTenantId, token]);

  /* ── animation helper ── */
  function fadeSlide(anim: Animated.Value) {
    return {
      opacity: anim,
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
          }),
        },
      ],
    };
  }

  /* ── data loading ── */
  async function loadAlerts(refresh = false) {
    if (!token || !selectedTenantId) return;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await listAlerts(token, selectedTenantId);
      setAlerts(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load alerts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleCreateAlert() {
    if (!token || !selectedTenantId) return;

    const trimmedName = entityName.trim();

    if (!trimmedName) {
      setCreateError('Entity name is required.');
      return;
    }

    const parsedImportance = minImportance.trim().length > 0 ? Number(minImportance) : null;

    if (parsedImportance !== null && (!Number.isFinite(parsedImportance) || parsedImportance < 0)) {
      setCreateError('Minimum importance must be a valid positive number.');
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    const payload: AlertCreateInput = {
      channel,
      entity_id: null,
      entity_name: trimmedName,
      entity_type: entityType,
      is_active: true,
      min_importance: parsedImportance,
      sentiment,
    };

    try {
      const created = await createAlert(token, selectedTenantId, payload);
      setAlerts((current) => [created, ...current]);
      setEntityName('');
      setEntityType('company');
      setSentiment('any');
      setChannel('email');
      setMinImportance('');
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Unable to create alert');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteAlert(alertId: string) {
    if (!token || !selectedTenantId) return;

    try {
      await deleteAlert(token, selectedTenantId, alertId);
      setAlerts((current) => current.filter((alert) => alert.id !== alertId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete alert');
    }
  }

  async function handleRunEngine() {
    if (!token || !selectedTenantId) return;

    const parsedLimit = Number(limitPerAlert);

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      setRunError('Limit per alert must be greater than zero.');
      return;
    }

    setRunError(null);
    setIsRunningEngine(true);

    try {
      const result = await runEmailAlerts(token, selectedTenantId, {
        dry_run: dryRun,
        limit_per_alert: parsedLimit,
      });

      setEngineRuns((current) => [
        {
          ...result,
          id: `${Date.now()}`,
          ran_at: new Date().toISOString(),
        },
        ...current,
      ]);
    } catch (engineError) {
      setRunError(engineError instanceof Error ? engineError.message : 'Unable to run email alerts');
    } finally {
      setIsRunningEngine(false);
    }
  }

  const activeCount = alerts.filter((a) => a.is_active).length;

  /* ── render ── */
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          onRefresh={() => void loadAlerts(true)}
          progressBackgroundColor={palette.panel}
          refreshing={isRefreshing}
          tintColor={palette.emerald}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ── */}
      <Animated.View style={[styles.hero, fadeSlide(heroAnim)]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Ionicons name="notifications" size={11} color={palette.emerald} />
            <Text style={styles.heroBadgeLabel}>ALERTS</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>Content Monitoring</Text>
        <Text style={styles.heroSubtitle}>
          Configure alert rules and manage delivery settings
        </Text>
        <Text style={styles.heroDate}>{fullDateFormatter.format(new Date())}</Text>

        {/* Quick stats row */}
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{alerts.length}</Text>
            <Text style={styles.heroStatLabel}>Rules</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, { color: palette.emerald }]}>{activeCount}</Text>
            <Text style={styles.heroStatLabel}>Active</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{engineRuns.length}</Text>
            <Text style={styles.heroStatLabel}>Runs</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Error Banner ── */}
      {error ? (
        <View style={styles.errorBanner}>
          <View style={styles.errorHeader}>
            <Ionicons name="alert-circle" size={18} color={palette.rose} />
            <Text style={styles.errorTitle}>Unable to load alerts</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => void loadAlerts()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Ionicons name="refresh-outline" size={14} color={palette.ink} />
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {/* ── Saved Alert Rules Panel ── */}
      <Animated.View style={[styles.panel, fadeSlide(rulesAnim)]}>
        <View style={[styles.panelAccent, { backgroundColor: palette.emerald }]} />

        <View style={styles.panelHeader}>
          <View style={styles.panelHeaderLeft}>
            <View style={styles.panelIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={16} color={palette.emerald} />
            </View>
            <View style={styles.panelHeaderCopy}>
              <Text style={styles.panelTitle}>Saved Alert Rules</Text>
              <Text style={styles.panelDescription}>Tenant-scoped monitoring and delivery</Text>
            </View>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{alerts.length}</Text>
          </View>
        </View>

        {/* Entity name input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Entity Name</Text>
          <View
            style={[
              styles.inputWrap,
              entityFocused && styles.inputWrapFocused,
            ]}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={entityFocused ? palette.emerald : palette.inkSoft}
            />
            <TextInput
              onChangeText={(text) => {
                setEntityName(text);
                setCreateError(null);
              }}
              onFocus={() => setEntityFocused(true)}
              onBlur={() => setEntityFocused(false)}
              placeholder="e.g. Apple, TSLA, Elon Musk"
              placeholderTextColor={palette.inkSoft}
              style={styles.input}
              value={entityName}
            />
          </View>
        </View>

        {/* Entity Type — STACKED (not side-by-side) */}
        <OptionGroup
          icon={ENTITY_ICONS[entityType]}
          label="Entity Type"
          options={entityTypeOptions}
          selected={entityType}
          onSelect={(value) => setEntityType(value as EntityType)}
        />

        {/* Sentiment — STACKED */}
        <OptionGroup
          icon={SENTIMENT_ICONS[sentiment]}
          label="Sentiment Filter"
          options={sentimentOptions}
          selected={sentiment}
          onSelect={(value) => setSentiment(value as AlertSentiment)}
        />

        {/* Channel — STACKED */}
        <OptionGroup
          icon={CHANNEL_ICONS[channel]}
          label="Delivery Channel"
          options={channelOptions}
          selected={channel}
          onSelect={(value) => setChannel(value as AlertChannel)}
        />

        {/* Min Importance */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Min Importance</Text>
          <View
            style={[
              styles.inputWrap,
              importanceFocused && styles.inputWrapFocused,
            ]}
          >
            <Ionicons
              name="flash-outline"
              size={16}
              color={importanceFocused ? palette.emerald : palette.inkSoft}
            />
            <TextInput
              inputMode="numeric"
              onChangeText={setMinImportance}
              onFocus={() => setImportanceFocused(true)}
              onBlur={() => setImportanceFocused(false)}
              placeholder="Optional threshold (0-10)"
              placeholderTextColor={palette.inkSoft}
              style={styles.input}
              value={minImportance}
            />
          </View>
        </View>

        {/* Create error */}
        {createError ? (
          <View style={styles.inlineErrorWrap}>
            <Ionicons name="alert-circle-outline" size={14} color={palette.rose} />
            <Text style={styles.inlineError}>{createError}</Text>
          </View>
        ) : null}

        {/* Create button */}
        <Pressable
          disabled={isCreating}
          onPress={() => void handleCreateAlert()}
          style={({ pressed }) => [
            styles.primaryButton,
            (!entityName.trim() && !isCreating) && styles.buttonDimmed,
            pressed && styles.pressedScale,
          ]}
        >
          {isCreating ? (
            <ActivityIndicator color={palette.canvas} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={16} color={palette.canvas} />
              <Text style={styles.primaryButtonLabel}>Create Alert Rule</Text>
            </>
          )}
        </Pressable>

        {/* Alert list */}
        <View style={styles.alertList}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={palette.emerald} size="large" />
              <Text style={styles.loadingText}>Loading alert rules...</Text>
            </View>
          ) : null}

          {!isLoading && alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={36} color={palette.inkSoft} />
              <Text style={styles.emptyTitle}>No alert rules yet</Text>
              <Text style={styles.emptyText}>
                Create your first alert rule above to start monitoring entities.
              </Text>
            </View>
          ) : null}

          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDelete={() => void handleDeleteAlert(alert.id)}
            />
          ))}
        </View>
      </Animated.View>

      {/* ── Email Alert Engine Panel ── */}
      <Animated.View style={[styles.panel, fadeSlide(engineAnim)]}>
        <View style={[styles.panelAccent, { backgroundColor: palette.cobalt }]} />

        <View style={styles.panelHeader}>
          <View style={styles.panelHeaderLeft}>
            <View style={[styles.panelIconWrap, { backgroundColor: palette.cobaltSoft }]}>
              <Ionicons name="rocket-outline" size={16} color={palette.cobalt} />
            </View>
            <View style={styles.panelHeaderCopy}>
              <Text style={styles.panelTitle}>Alert Engine</Text>
              <Text style={styles.panelDescription}>Evaluate active alerts manually</Text>
            </View>
          </View>
        </View>

        {/* Limit per alert */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Limit Per Alert</Text>
          <View style={[styles.inputWrap, limitFocused && styles.inputWrapFocused]}>
            <Ionicons
              name="options-outline"
              size={16}
              color={limitFocused ? palette.emerald : palette.inkSoft}
            />
            <TextInput
              inputMode="numeric"
              onChangeText={setLimitPerAlert}
              onFocus={() => setLimitFocused(true)}
              onBlur={() => setLimitFocused(false)}
              placeholder="5"
              placeholderTextColor={palette.inkSoft}
              style={styles.input}
              value={limitPerAlert}
            />
          </View>
        </View>

        {/* Dry run switch — properly laid out, no side-by-side */}
        <View style={styles.switchCard}>
          <View style={styles.switchCopy}>
            <View style={styles.switchLabelRow}>
              <Ionicons name="flask-outline" size={14} color={palette.inkSoft} />
              <Text style={styles.fieldLabel}>Dry Run</Text>
            </View>
            <Text style={styles.switchHint}>
              Skip delivery and report match counts only. No emails will be sent.
            </Text>
          </View>
          <Switch
            onValueChange={setDryRun}
            thumbColor={dryRun ? palette.emerald : palette.inkSoft}
            trackColor={{ false: palette.lineStrong, true: palette.emeraldSoft }}
            value={dryRun}
          />
        </View>

        {/* Run error */}
        {runError ? (
          <View style={styles.inlineErrorWrap}>
            <Ionicons name="alert-circle-outline" size={14} color={palette.rose} />
            <Text style={styles.inlineError}>{runError}</Text>
          </View>
        ) : null}

        {/* Run button */}
        <Pressable
          disabled={isRunningEngine}
          onPress={() => void handleRunEngine()}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressedScale,
          ]}
        >
          {isRunningEngine ? (
            <ActivityIndicator color={palette.cobalt} />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={16} color={palette.cobalt} />
              <Text style={styles.secondaryButtonLabel}>Run Email Alerts</Text>
            </>
          )}
        </Pressable>
      </Animated.View>

      {/* ── Recent Triggers Panel ── */}
      <Animated.View style={[styles.panel, fadeSlide(triggersAnim)]}>
        <View style={[styles.panelAccent, { backgroundColor: palette.amber }]} />

        <View style={styles.panelHeader}>
          <View style={styles.panelHeaderLeft}>
            <View style={[styles.panelIconWrap, { backgroundColor: palette.amberSoft }]}>
              <Ionicons name="pulse-outline" size={16} color={palette.amber} />
            </View>
            <View style={styles.panelHeaderCopy}>
              <Text style={styles.panelTitle}>Recent Triggers</Text>
              <Text style={styles.panelDescription}>Engine activity and alert history</Text>
            </View>
          </View>
          {engineRuns.length > 0 ? (
            <View style={[styles.countBadge, { backgroundColor: palette.amberSoft }]}>
              <Text style={[styles.countBadgeText, { color: palette.amber }]}>
                {engineRuns.length}
              </Text>
            </View>
          ) : null}
        </View>

        {engineRuns.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={36} color={palette.inkSoft} />
            <Text style={styles.emptyTitle}>No recent activity</Text>
            <Text style={styles.emptyText}>
              Results from manual engine runs will appear here. The API does not
              expose a dedicated trigger-history endpoint.
            </Text>
          </View>
        ) : (
          <View style={styles.runList}>
            {engineRuns.map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

/* ────────────────────────────────────────────────────── */
/*  Sub-components                                        */
/* ────────────────────────────────────────────────────── */

function OptionGroup({
  icon,
  label,
  onSelect,
  options,
  selected,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onSelect: (value: string) => void;
  options: readonly string[];
  selected: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        {icon ? <Ionicons name={icon} size={13} color={palette.inkSoft} /> : null}
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <View style={styles.optionWrap}>
        {options.map((option) => {
          const isSelected = selected === option;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.optionChip,
                isSelected && styles.optionChipSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.optionChipLabel,
                  isSelected && styles.optionChipLabelSelected,
                ]}
              >
                {formatOptionLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AlertCard({
  alert,
  onDelete,
}: {
  alert: AlertPublic;
  onDelete: () => void;
}) {
  const channelIcon = CHANNEL_ICONS[alert.channel as AlertChannel] ?? 'notifications-outline';

  return (
    <View style={styles.alertCard}>
      <View style={[styles.alertAccent, { backgroundColor: alert.is_active ? palette.emerald : palette.lineStrong }]} />

      <View style={styles.alertInner}>
        <View style={styles.alertCardTop}>
          <View style={styles.alertCopy}>
            <Text style={styles.alertEntity}>{alert.entity_name ?? 'Unnamed entity'}</Text>
            <View style={styles.alertMetaRow}>
              <View style={styles.alertMetaBadge}>
                <Ionicons name={channelIcon} size={11} color={palette.cobalt} />
                <Text style={styles.alertMetaText}>{formatOptionLabel(alert.channel)}</Text>
              </View>
              <View style={[styles.alertMetaBadge, { backgroundColor: palette.emeraldSoft }]}>
                <Text style={[styles.alertMetaText, { color: palette.emerald }]}>
                  {formatOptionLabel(alert.sentiment)}
                </Text>
              </View>
              {alert.min_importance !== null ? (
                <View style={[styles.alertMetaBadge, { backgroundColor: palette.amberSoft }]}>
                  <Ionicons name="flash" size={10} color={palette.amber} />
                  <Text style={[styles.alertMetaText, { color: palette.amber }]}>
                    Min {alert.min_importance}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={[styles.statusBadge, alert.is_active ? styles.statusActive : styles.statusMuted]}>
            <View style={[styles.statusDot, { backgroundColor: alert.is_active ? palette.emerald : palette.inkSoft }]} />
            <Text style={[styles.statusBadgeText, { color: alert.is_active ? palette.emerald : palette.inkSoft }]}>
              {alert.is_active ? 'Active' : 'Off'}
            </Text>
          </View>
        </View>

        <View style={styles.alertFooter}>
          <Text style={styles.alertTimestamp}>
            <Ionicons name="time-outline" size={11} color={palette.inkSoft} />{' '}
            {formatCreatedAt(alert.created_at)}
          </Text>
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={13} color={palette.rose} />
            <Text style={styles.deleteButtonLabel}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function RunCard({ run }: { run: EngineRunItem }) {
  return (
    <View style={styles.runCard}>
      <View style={[styles.runAccent, { backgroundColor: run.dry_run ? palette.cobalt : palette.emerald }]} />

      <View style={styles.runInner}>
        <View style={styles.runCardTop}>
          <View style={styles.runTitleRow}>
            <Ionicons
              name={run.dry_run ? 'flask-outline' : 'send-outline'}
              size={14}
              color={run.dry_run ? palette.cobalt : palette.emerald}
            />
            <Text style={styles.runTitle}>
              {run.dry_run ? 'Dry Run' : 'Delivery Run'}
            </Text>
          </View>
          <Text style={styles.runTimestamp}>{formatCreatedAt(run.ran_at)}</Text>
        </View>

        <View style={styles.runStats}>
          <MetricPill label="Evaluated" value={run.alerts_evaluated} tone="default" />
          <MetricPill label="Matches" value={run.matches_found} tone="emerald" />
          <MetricPill label="Sent" value={run.sent} tone="cobalt" />
          <MetricPill label="Skipped" value={run.skipped_duplicates} tone="amber" />
          <MetricPill label="Failed" value={run.failed} tone="rose" />
        </View>
      </View>
    </View>
  );
}

function MetricPill({
  label,
  tone,
  value,
}: {
  label: string;
  tone: 'default' | 'emerald' | 'cobalt' | 'amber' | 'rose';
  value: number;
}) {
  const toneMap = {
    default: { bg: palette.canvasMuted, text: palette.ink, border: palette.line },
    emerald: { bg: palette.emeraldSoft, text: palette.emerald, border: `${palette.emerald}22` },
    cobalt: { bg: palette.cobaltSoft, text: palette.cobalt, border: `${palette.cobalt}22` },
    amber: { bg: palette.amberSoft, text: palette.amber, border: `${palette.amber}22` },
    rose: { bg: palette.roseSoft, text: palette.rose, border: `${palette.rose}22` },
  };
  const t = toneMap[tone];

  return (
    <View style={[styles.metricPill, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={styles.metricPillLabel}>{label}</Text>
      <Text style={[styles.metricPillValue, { color: t.text }]}>{value}</Text>
    </View>
  );
}

/* ────────────────────────────────────────────────────── */
/*  Styles                                                */
/* ────────────────────────────────────────────────────── */

const CARD_RADIUS = radii.md;
const SECTION_PAD = spacing.lg;

const styles = StyleSheet.create({
  /* ── layout ── */
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl + 8,
    paddingHorizontal: SECTION_PAD,
    paddingTop: spacing.md,
  },

  /* ── hero ── */
  hero: {
    backgroundColor: palette.canvas,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: SECTION_PAD,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  heroBadge: {
    alignItems: 'center',
    backgroundColor: palette.emeraldSoft,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  heroBadgeLabel: {
    color: palette.emerald,
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: palette.white,
    fontFamily: typography.serifBold,
    fontSize: 30,
    lineHeight: 36,
  },
  heroSubtitle: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  heroDate: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 13,
    letterSpacing: 0.3,
    marginTop: spacing.sm,
  },
  heroStatsRow: {
    alignItems: 'center',
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatValue: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 24,
  },
  heroStatLabel: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  heroStatDivider: {
    backgroundColor: palette.line,
    height: 28,
    width: 1,
  },

  /* ── error ── */
  errorBanner: {
    backgroundColor: palette.roseSoft,
    borderColor: `${palette.rose}44`,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: SECTION_PAD,
  },
  errorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  errorTitle: {
    color: palette.rose,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorText: {
    color: palette.ink,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.panel,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md,
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  retryLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.6,
  },

  /* ── panels ── */
  panel: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: SECTION_PAD,
    paddingTop: 0,
  },
  panelAccent: {
    height: 3,
    marginBottom: SECTION_PAD,
    width: '100%',
  },
  panelHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  panelHeaderLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  panelIconWrap: {
    alignItems: 'center',
    backgroundColor: palette.emeraldSoft,
    borderRadius: radii.sm,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  panelHeaderCopy: {
    flex: 1,
  },
  panelTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 20,
  },
  panelDescription: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: palette.emeraldSoft,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  countBadgeText: {
    color: palette.emerald,
    fontFamily: typography.monoBold,
    fontSize: 12,
  },

  /* ── form fields ── */
  fieldGroup: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  fieldLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  fieldLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.lineStrong,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  inputWrapFocused: {
    borderColor: palette.emerald,
  },
  input: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 16,
    minHeight: 52,
  },

  /* ── option chips ── */
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  optionChip: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  optionChipSelected: {
    backgroundColor: palette.cobalt,
    borderColor: palette.cobalt,
  },
  optionChipLabel: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  optionChipLabelSelected: {
    color: palette.canvas,
  },

  /* ── inline errors ── */
  inlineErrorWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  inlineError: {
    color: palette.rose,
    flex: 1,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
  },

  /* ── buttons ── */
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 50,
  },
  primaryButtonLabel: {
    color: palette.canvas,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 0.8,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: palette.cobaltSoft,
    borderColor: `${palette.cobalt}33`,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 50,
  },
  secondaryButtonLabel: {
    color: palette.cobalt,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 0.8,
  },
  buttonDimmed: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.78,
  },
  pressedScale: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  /* ── switch card ── */
  switchCard: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  switchCopy: {
    flex: 1,
  },
  switchLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  switchHint: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  /* ── alert list ── */
  alertList: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  alertCard: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  alertAccent: {
    height: 3,
    width: '100%',
  },
  alertInner: {
    padding: spacing.md,
  },
  alertCardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  alertCopy: {
    flex: 1,
  },
  alertEntity: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 17,
    lineHeight: 22,
  },
  alertMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  alertMetaBadge: {
    alignItems: 'center',
    backgroundColor: palette.cobaltSoft,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  alertMetaText: {
    color: palette.cobalt,
    fontFamily: typography.monoBold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  statusDot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  statusActive: {
    backgroundColor: palette.emeraldSoft,
  },
  statusMuted: {
    backgroundColor: palette.panelAlt,
  },
  statusBadgeText: {
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  alertFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  alertTimestamp: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 12,
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: `${palette.rose}33`,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  deleteButtonLabel: {
    color: palette.rose,
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },

  /* ── loading / empty ── */
  loadingState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 15,
    letterSpacing: 0.4,
    marginTop: spacing.md,
  },
  emptyText: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },

  /* ── run cards ── */
  runList: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  runCard: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  runAccent: {
    height: 3,
    width: '100%',
  },
  runInner: {
    padding: spacing.md,
  },
  runCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  runTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  runTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  runTimestamp: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 12,
  },
  runStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metricPill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  metricPillLabel: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  metricPillValue: {
    fontFamily: typography.monoBold,
    fontSize: 15,
    marginTop: 2,
  },
});
