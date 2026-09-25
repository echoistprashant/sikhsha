import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

interface GlassViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: 'light' | 'medium' | 'strong';
}

/**
 * GlassView - Flexible glass container matching web's .glass-panel style
 */
export const GlassView: React.FC<GlassViewProps> = ({
    children,
    style,
    intensity = 'medium',
}) => {
    const { colors, isDark } = useTheme();

    const getIntensityStyles = () => {
        const intensities = {
            light: { opacity: 0.5, borderOpacity: 0.15 },
            medium: { opacity: 0.7, borderOpacity: 0.25 },
            strong: { opacity: 0.85, borderOpacity: 0.35 },
        };
        return intensities[intensity];
    };

    const { opacity, borderOpacity } = getIntensityStyles();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDark
                        ? `rgba(31, 31, 31, ${opacity})`
                        : `rgba(255, 255, 255, ${opacity})`,
                    borderColor: isDark
                        ? `rgba(255, 255, 255, ${borderOpacity})`
                        : `rgba(0, 0, 0, ${borderOpacity * 0.3})`,
                },
                style,
            ]}>
            {/* Top highlight rim */}
            <View
                style={[
                    styles.rimHighlight,
                    {
                        backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(255, 255, 255, 0.5)',
                    },
                ]}
            />
            <View style={styles.content}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderWidth: 1,
        borderRadius: radius.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    rimHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
    },
    content: {
        zIndex: 1,
    },
});
