import React, { useState } from 'react';
import {
    TextInput,
    StyleSheet,
    View,
    Text,
    TextInputProps,
    ViewStyle,
    Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows, typography } from '../constants/theme';

interface GlassInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

/**
 * GlassInput - Form input matching web's .glass-input style
 */
const GlassInput: React.FC<GlassInputProps> = ({
    label,
    error,
    containerStyle,
    style,
    ...props
}) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: isDark
                            ? 'rgba(31, 31, 31, 0.6)'
                            : 'rgba(255, 255, 255, 0.5)',
                        borderColor: error
                            ? colors.error
                            : isFocused
                                ? colors.primary
                                : isDark
                                    ? 'rgba(255, 255, 255, 0.15)'
                                    : 'rgba(0, 0, 0, 0.1)',
                    },
                    isFocused && styles.inputFocused,
                ]}>
                {/* Top rim highlight */}
                <View
                    style={[
                        styles.rimHighlight,
                        { opacity: isDark ? 0.05 : 0.2 },
                    ]}
                />
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.textPrimary,
                        },
                        style,
                    ]}
                    placeholderTextColor={colors.textTertiary}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />
            </View>
            {error && (
                <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        marginBottom: 6,
    },
    inputWrapper: {
        borderRadius: radius.md,
        borderWidth: 1,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                ...shadows.input,
            },
            android: {
                elevation: shadows.input.elevation,
            },
        }),
    },
    inputFocused: {
        borderWidth: 2,
    },
    rimHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#FFFFFF',
        zIndex: 1,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: typography.sizes.md,
    },
    error: {
        fontSize: typography.sizes.xs,
        marginTop: 4,
    },
});

export default GlassInput;
