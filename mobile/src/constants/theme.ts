/**
 * Shiksha Design System - Theme Tokens
 * Centralized design tokens for consistent styling across the app
 */

// Glass effect configuration
export const glassEffects = {
    blur: {
        light: 12,
        medium: 16,
        strong: 20,
    },
    opacity: {
        light: 0.6,
        medium: 0.7,
        heavy: 0.85,
    },
};

// Border radius tokens
export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 9999,
};

// Spacing tokens
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Shadow configurations
export const shadows = {
    card: {
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    cardHover: {
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        elevation: 12,
    },
    button: {
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    input: {
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
};

// Animation durations (ms)
export const animations = {
    fast: 150,
    normal: 250,
    slow: 400,
};

// Typography scale
export const typography = {
    sizes: {
        xs: 11,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
    },
};
