import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, typography } from '../constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'emerald';

interface GlassBadgeProps {
    text: string;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

/**
 * GlassBadge - Badge component matching web's .glass-badge style
 */
const GlassBadge: React.FC<GlassBadgeProps> = ({
    text,
    variant = 'default',
    size = 'md',
    style,
}) => {
    const { colors, isDark } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    backgroundColor: isDark
                        ? 'rgba(76, 175, 80, 0.2)'
                        : 'rgba(220, 252, 231, 0.8)',
                    borderColor: isDark
                        ? 'rgba(76, 175, 80, 0.4)'
                        : 'rgba(134, 239, 172, 0.5)',
                    textColor: isDark ? '#86efac' : '#166534',
                };
            case 'warning':
                return {
                    backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(254, 249, 195, 0.8)',
                    borderColor: isDark
                        ? 'rgba(245, 158, 11, 0.4)'
                        : 'rgba(253, 224, 71, 0.5)',
                    textColor: isDark ? '#fde047' : '#a16207',
                };
            case 'danger':
                return {
                    backgroundColor: isDark
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(254, 226, 226, 0.8)',
                    borderColor: isDark
                        ? 'rgba(239, 68, 68, 0.4)'
                        : 'rgba(252, 165, 165, 0.5)',
                    textColor: isDark ? '#fca5a5' : '#b91c1c',
                };
            case 'emerald':
                return {
                    backgroundColor: colors.glass.emerald,
                    borderColor: isDark
                        ? 'rgba(76, 175, 80, 0.4)'
                        : 'rgba(76, 175, 80, 0.3)',
                    textColor: colors.primary,
                };
            default:
                return {
                    backgroundColor: isDark
                        ? 'rgba(51, 65, 85, 0.6)'
                        : 'rgba(241, 245, 249, 0.8)',
                    borderColor: isDark
                        ? 'rgba(71, 85, 105, 0.5)'
                        : 'rgba(226, 232, 240, 0.5)',
                    textColor: colors.textSecondary,
                };
        }
    };

    const variantStyles = getVariantStyles();
    const isSmall = size === 'sm';

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: variantStyles.backgroundColor,
                    borderColor: variantStyles.borderColor,
                    paddingVertical: isSmall ? 2 : 4,
                    paddingHorizontal: isSmall ? 6 : 10,
                },
                style,
            ]}>
            <Text
                style={[
                    styles.text,
                    {
                        color: variantStyles.textColor,
                        fontSize: isSmall ? typography.sizes.xs : typography.sizes.sm,
                    },
                ]}>
                {text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: radius.pill,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: typography.weights.medium,
    },
});

export default GlassBadge;
