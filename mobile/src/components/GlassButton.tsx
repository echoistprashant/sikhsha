import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    Platform,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows, typography } from '../constants/theme';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

/**
 * GlassButton - Premium glass button matching web's .glass-button-wrap style
 */
const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon,
}) => {
    const { colors, isDark } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    container: {
                        backgroundColor: colors.glass.emerald,
                        borderColor: isDark
                            ? 'rgba(76, 175, 80, 0.4)'
                            : 'rgba(76, 175, 80, 0.3)',
                    },
                    text: {
                        color: isDark ? colors.textPrimary : colors.textPrimary,
                    },
                };
            case 'secondary':
                return {
                    container: {
                        backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.05)',
                        borderColor: colors.glass.rim,
                    },
                    text: {
                        color: colors.textPrimary,
                    },
                };
            case 'outline':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderColor: colors.primary,
                    },
                    text: {
                        color: colors.primary,
                    },
                };
            default:
                return {
                    container: {},
                    text: {},
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: { paddingVertical: 8, paddingHorizontal: 14 },
                    fontSize: typography.sizes.sm,
                };
            case 'lg':
                return {
                    padding: { paddingVertical: 16, paddingHorizontal: 24 },
                    fontSize: typography.sizes.lg,
                };
            default:
                return {
                    padding: { paddingVertical: 12, paddingHorizontal: 20 },
                    fontSize: typography.sizes.md,
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.container,
                variantStyles.container,
                sizeStyles.padding,
                disabled && styles.disabled,
                style,
            ]}>
            {/* Inner highlight for glass rim effect */}
            <View style={[styles.rimHighlight, { opacity: isDark ? 0.1 : 0.3 }]} />

            {loading ? (
                <ActivityIndicator color={variantStyles.text.color} size="small" />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text
                        style={[
                            styles.text,
                            variantStyles.text,
                            { fontSize: sizeStyles.fontSize },
                            textStyle,
                        ]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                ...shadows.button,
            },
            android: {
                elevation: shadows.button.elevation,
            },
        }),
    },
    rimHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        fontWeight: typography.weights.semibold,
        letterSpacing: typography.letterSpacing.tight,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default GlassButton;
