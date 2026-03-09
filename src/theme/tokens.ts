export const palette = {
  background: '#111317',
  panel: '#1a1d22',
  panelAlt: '#242830',
  canvas: '#0b0d10',
  canvasMuted: '#13161b',
  ink: '#f5f7fb',
  inkSoft: '#96a0af',
  line: '#2a2f38',
  lineStrong: '#39414d',
  emerald: '#16e05e',
  emeraldSoft: '#102316',
  cobalt: '#8ea4ff',
  cobaltSoft: '#1a2238',
  amber: '#ffb44a',
  amberSoft: '#2d2111',
  rose: '#ff7d7d',
  roseSoft: '#30181d',
  white: '#ffffff',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#161816',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
} as const;

export const typography = {
  serif: 'Newsreader_500Medium',
  serifBold: 'Newsreader_700Bold',
  mono: 'Inconsolata_500Medium',
  monoBold: 'Inconsolata_700Bold',
} as const;
