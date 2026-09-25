import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'emerald';
}

/**
 * GlassCard - Glassmorphism card component matching web's .glass-card style
 */
const GlassCard: React.FC<Props> = ({ children, style, variant = 'default' }) => {
  const { colors, isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          backgroundColor: colors.glass.emerald,
          borderColor: isDark
            ? 'rgba(76, 175, 80, 0.3)'
            : 'rgba(76, 175, 80, 0.2)',
        };
      case 'elevated':
        return {
          backgroundColor: colors.card.background,
          borderColor: colors.card.border,
          ...shadows.cardHover,
        };
      default:
        return {
          backgroundColor: colors.card.background,
          borderColor: colors.card.border,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyles(),
        { shadowColor: colors.card.shadow },
        style,
      ]}>
      {/* Inner highlight for glass effect */}
      <View style={[styles.innerHighlight, { opacity: isDark ? 0.03 : 0.1 }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        ...shadows.card,
      },
      android: {
        elevation: shadows.card.elevation,
      },
    }),
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
});

export default GlassCard;
