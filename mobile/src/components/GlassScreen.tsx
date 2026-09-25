import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
}

/**
 * GlassScreen - Base screen container with Shiksha theme background
 */
const GlassScreen: React.FC<Props> = ({ children }) => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {/* Subtle gradient overlay for depth */}
      <View
        style={[
          styles.gradientOverlay,
          {
            backgroundColor: isDark
              ? 'rgba(76, 175, 80, 0.02)' // Subtle emerald tint in dark mode
              : 'transparent',
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export default GlassScreen;
