export const palette = {
  periwinkle: '#8aa8ff',
  periwinkleDim: '#6b8ae0',
  periwinkleGlow: '#a4bfff',

  green: '#00f700',
  greenDim: '#00c700',
  cyan: '#00eff0',
  amber: '#ff9f43',
  rose: '#ff6b6b',

  white: '#ffffff',
  gray50: '#f8f9fa',
  gray100: '#f1f3f5',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#868e96',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#212529',
  black: '#000000',
} as const;

export const darkColors = {
  background: '#1a1a1a',
  backgroundAlt: '#141414',
  surface: '#2e2e2e',
  surfaceElevated: '#363636',
  muted: '#3a3a3a',
  border: '#404040',
  borderSubtle: '#333333',

  text: '#f0f0f0',
  textSecondary: '#a0a0a0',
  textTertiary: '#6b6b6b',
  textInverse: '#1a1a1a',

  primary: palette.periwinkle,
  primaryDim: palette.periwinkleDim,
  primaryGlow: palette.periwinkleGlow,

  success: palette.green,
  info: palette.cyan,
  warning: palette.amber,
  danger: palette.rose,

  sentimentPositive: '#10b981',
  sentimentNegative: '#ef4444',
  sentimentNeutral: '#eab308',

  chart1: palette.periwinkle,
  chart2: palette.green,
  chart3: palette.cyan,
  chart4: palette.amber,
  chart5: palette.rose,

  tabBarBackground: '#111111',
  tabBarBorder: '#2a2a2a',
  tabBarActive: palette.periwinkle,
  tabBarInactive: '#666666',

  cardGlass: 'rgba(46, 46, 46, 0.6)',
  overlay: 'rgba(0, 0, 0, 0.6)',

  inputBackground: '#252525',
  statusBarStyle: 'light' as const,
};

export const lightColors = {
  background: '#ffffff',
  backgroundAlt: '#f5f5f5',
  surface: '#f8f9fa',
  surfaceElevated: '#ffffff',
  muted: '#f1f3f5',
  border: '#e5e7eb',
  borderSubtle: '#eeeeee',

  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#ffffff',

  primary: '#7090e0',
  primaryDim: '#5a78c8',
  primaryGlow: palette.periwinkle,

  success: '#00c700',
  info: '#00b8c0',
  warning: '#e88a30',
  danger: '#e05050',

  sentimentPositive: '#10b981',
  sentimentNegative: '#ef4444',
  sentimentNeutral: '#eab308',

  chart1: '#7090e0',
  chart2: '#00c700',
  chart3: '#00b8c0',
  chart4: '#e88a30',
  chart5: '#e05050',

  tabBarBackground: '#ffffff',
  tabBarBorder: '#e5e7eb',
  tabBarActive: '#7090e0',
  tabBarInactive: '#999999',

  cardGlass: 'rgba(255, 255, 255, 0.7)',
  overlay: 'rgba(0, 0, 0, 0.3)',

  inputBackground: '#f1f3f5',
  statusBarStyle: 'dark' as const,
};

export type ThemeColors = {
  [K in keyof typeof darkColors]: string;
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    shadowColor: palette.periwinkle,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
