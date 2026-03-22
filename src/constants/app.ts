export const APP_NAME = 'NewsFlash';
export const APP_VERSION = '1.0.0';

export const ANIMATION = {
  STAGGER_DELAY: 50,
  MAX_STAGGER_ITEMS: 10,
  SPRING_CONFIG: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  PRESS_SCALE: 0.97,
  CARD_PRESS_SCALE: 0.98,
} as const;

export const LIST = {
  ARTICLE_COMPACT_HEIGHT: 72,
  ARTICLE_EXPANDED_HEIGHT: 180,
  ALERT_ROW_HEIGHT: 88,
  WATCHLIST_ROW_HEIGHT: 72,
  PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

export const SENTIMENT_LABELS = {
  positive: 'Positive',
  negative: 'Negative',
  neutral: 'Neutral',
} as const;
