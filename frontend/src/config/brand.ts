export const BRAND = {
  name: 'Scorecard',
  tagline: '목적 인식형 AI 진단·개선',
  colors: {
    primary: '#185FA5',
    primaryDark: '#042C53',
    surfaces: {
      subtle: '#F7FAFE',
      cardBlue: '#F0F7FF',
    },
    badges: {
      purposeA: { bg: '#E6F1FB', text: '#0C447C' },
      purposeB: { bg: '#FAEEDA', text: '#633806' },
    },
    highlights: {
      success: { bg: '#E1F5EE', text: '#0F5C3E', icon: '#1F9D6B' },
      warning: { bg: '#FAEEDA', text: '#633806', icon: '#BA7517', border: '#F0D89A' },
    },
  },
  fontSize: {
    bodySmall: 14,
    body: 15,
    subtitleSmall: 17,
    subtitle: 18,
    titleSmall: 22,
    titleMedium: 28,
    titleLarge: 30,
  },
  fontWeight: {
    regular: 400,
    semibold: 600,
  },
} as const;
