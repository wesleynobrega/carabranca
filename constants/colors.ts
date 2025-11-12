export const Colors = {
  primary: '#2D5016',
  primaryLight: '#3D6B22',
  primaryDark: '#1A3309',
  
  secondary: '#6B8E23',
  secondaryLight: '#8BAA42',
  
  accent: '#F4A460',
  accentLight: '#FFB87A',
  
  background: '#FAF9F6',
  cardBackground: '#FFFFFF',
  
  text: '#2C2C2C',
  textLight: '#666666',
  textMuted: '#999999',
  
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  white: '#FFFFFF',
  black: '#000000',
  
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
