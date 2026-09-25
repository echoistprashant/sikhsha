import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radius, shadows } from '../../constants/theme';

interface Props {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'glass' | 'elevated';
}

/**
 * ModernCard - Versatile card component with Shiksha theme styling
 */
const ModernCard: React.FC<Props> = ({ children, style, variant = 'default' }) => {
    const { colors, isDark } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    backgroundColor: colors.card.background,
                    borderColor: colors.card.border,
                    shadowOpacity: 0.15,
                };
            case 'elevated':
                return {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    ...shadows.cardHover,
                };
            default:
                return {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowOpacity: 0.1,
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: variantStyles.backgroundColor,
                    borderColor: variantStyles.borderColor,
                    shadowColor: isDark ? '#000000' : colors.textPrimary,
                },
                style,
            ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: radius.xl,
        padding: 16,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
            },
            android: {
                elevation: 5,
            },
        }),
    },
});

export default ModernCard;
