export type TimeWindow = '24H' | '7D' | '30D' | '90D';

const WINDOW_HOURS: Record<TimeWindow, number> = {
  '24H': 24,
  '7D': 24 * 7,
  '30D': 24 * 30,
  '90D': 24 * 90,
};

export function isWithinTimeWindow(
  dateValue: string,
  timeWindow: TimeWindow,
  now = new Date(),
) {
  const target = new Date(dateValue);
  const diffMs = now.getTime() - target.getTime();

  return diffMs <= WINDOW_HOURS[timeWindow] * 60 * 60 * 1000;
}
