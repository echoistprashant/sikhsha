import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Platform,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows, typography } from '../constants/theme';

interface Option {
    value: string;
    label: string;
}

interface GlassDropdownProps {
    label?: string;
    placeholder?: string;
    options: Option[];
    value: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    containerStyle?: ViewStyle;
}

/**
 * GlassDropdown - Glass-styled dropdown matching the Shiksha design system
 */
const GlassDropdown: React.FC<GlassDropdownProps> = ({
    label,
    placeholder = 'Select...',
    options,
    value,
    onSelect,
    disabled = false,
    loading = false,
    error,
    containerStyle,
}) => {
    const { colors, isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption?.label || placeholder;

    const handleSelect = (optionValue: string) => {
        onSelect(optionValue);
        setIsOpen(false);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {label}
                </Text>
            )}
            <TouchableOpacity
                style={[
                    styles.dropdown,
                    {
                        backgroundColor: isDark
                            ? 'rgba(31, 31, 31, 0.6)'
                            : 'rgba(255, 255, 255, 0.5)',
                        borderColor: error
                            ? colors.error
                            : isDark
                                ? 'rgba(255, 255, 255, 0.15)'
                                : 'rgba(0, 0, 0, 0.1)',
                    },
                    disabled && styles.dropdownDisabled,
                ]}
                onPress={() => !disabled && !loading && setIsOpen(true)}
                disabled={disabled || loading}
                activeOpacity={0.7}
            >
                {/* Top rim highlight */}
                <View
                    style={[
                        styles.rimHighlight,
                        { opacity: isDark ? 0.05 : 0.2 },
                    ]}
                />
                <Text
                    style={[
                        styles.dropdownText,
                        {
                            color: selectedOption
                                ? colors.textPrimary
                                : colors.textTertiary,
                        },
                        disabled && { opacity: 0.5 },
                    ]}
                >
                    {loading ? 'Loading...' : displayText}
                </Text>
                {loading ? (
                    <ActivityIndicator size="small" color={colors.textTertiary} />
                ) : (
                    <Text style={[styles.arrow, { color: colors.textTertiary }]}>
                        ▼
                    </Text>
                )}
            </TouchableOpacity>
            {error && (
                <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
            )}

            {/* Modal Picker */}
            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.modalHeader,
                                {
                                    borderBottomColor: isDark
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'rgba(0,0,0,0.1)',
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.modalTitle,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                {label || 'Select Option'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Text
                                    style={[
                                        styles.modalClose,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    ✕
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.optionsList}>
                            {options.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionItem,
                                        {
                                            backgroundColor:
                                                option.value === value
                                                    ? isDark
                                                        ? 'rgba(76, 175, 80, 0.2)'
                                                        : 'rgba(76, 175, 80, 0.1)'
                                                    : 'transparent',
                                            borderBottomColor: isDark
                                                ? 'rgba(255,255,255,0.05)'
                                                : 'rgba(0,0,0,0.05)',
                                        },
                                    ]}
                                    onPress={() => handleSelect(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            {
                                                color:
                                                    option.value === value
                                                        ? colors.primary
                                                        : colors.textPrimary,
                                                fontWeight:
                                                    option.value === value
                                                        ? '600'
                                                        : '400',
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {option.value === value && (
                                        <Text style={{ color: colors.primary }}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    dropdown: {
        borderRadius: radius.md,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    dropdownDisabled: {
        opacity: 0.5,
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
    dropdownText: {
        fontSize: typography.sizes.md,
        flex: 1,
    },
    arrow: {
        fontSize: 12,
        marginLeft: 8,
    },
    error: {
        fontSize: typography.sizes.xs,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalClose: {
        fontSize: 20,
        padding: 4,
    },
    optionsList: {
        padding: 8,
    },
    optionItem: {
        padding: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionText: {
        fontSize: 16,
    },
});

export default GlassDropdown;
