import type { AlertPublic } from '@/types/api';

const SEVERITY_SCORE: Record<AlertPublic['severity'], number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function compareAlerts(left: AlertPublic, right: AlertPublic) {
  const severityDelta = SEVERITY_SCORE[right.severity] - SEVERITY_SCORE[left.severity];

  if (severityDelta !== 0) {
    return severityDelta;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

export function getActiveCrisis(alerts: AlertPublic[]) {
  return alerts
    .filter((alert) => alert.type === 'crisis' && !alert.isResolved)
    .sort(compareAlerts)[0] ?? null;
}

export function getTopTrigger(alerts: AlertPublic[]) {
  return alerts
    .filter((alert) => alert.type !== 'crisis' && !alert.isResolved)
    .sort(compareAlerts)[0] ?? null;
}
