export const fontFamily = {
  serif: 'Newsreader_400Regular',
  serifMedium: 'Newsreader_500Medium',
  serifSemiBold: 'Newsreader_600SemiBold',
  serifBold: 'Newsreader_700Bold',
  serifItalic: 'Newsreader_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  mono: 'Inconsolata_400Regular',
  monoSemiBold: 'Inconsolata_600SemiBold',
} as const;

export const typePresets = {
  displayLg: {
    fontFamily: fontFamily.serifBold,
    fontSize: 32,
    lineHeight: 40,
  },
  displayMd: {
    fontFamily: fontFamily.serifBold,
    fontSize: 28,
    lineHeight: 36,
  },
  displaySm: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 24,
    lineHeight: 32,
  },

  h1: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  h2: {
    fontFamily: fontFamily.serifMedium,
    fontSize: 20,
    lineHeight: 26,
  },
  h3: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 17,
    lineHeight: 22,
  },

  bodyLg: {
    fontFamily: fontFamily.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 18,
  },

  label: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  labelXs: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },

  mono: {
    fontFamily: fontFamily.mono,
    fontSize: 14,
    lineHeight: 20,
  },
  monoSm: {
    fontFamily: fontFamily.mono,
    fontSize: 12,
    lineHeight: 16,
  },
  monoLg: {
    fontFamily: fontFamily.monoSemiBold,
    fontSize: 22,
    lineHeight: 28,
  },

  articleTitle: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  articleBody: {
    fontFamily: fontFamily.serif,
    fontSize: 16,
    lineHeight: 26,
  },
} as const;
