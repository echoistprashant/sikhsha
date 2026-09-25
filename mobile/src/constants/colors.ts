/**
 * Shiksha Design System Colors
 * Matches web frontend's globals.css theme
 */

export const colors = {
    light: {
        // Shiksha palette: Warm neutrals + Dark charcoal + Emerald green
        background: '#E5E1DD', // Shiksha ivory - warm neutral
        surface: '#FFFFFF',
        surfaceHighlight: '#EDEBE7', // Soft warm gray
        textPrimary: '#1F1F1F', // Shiksha charcoal
        textSecondary: '#6B7280', // Medium gray
        textTertiary: '#9CA3AF', // Light gray
        primary: '#4CAF50', // Shiksha emerald accent
        primaryLight: 'rgba(76, 175, 80, 0.1)',
        border: '#D6D3CD', // Warm gray border
        success: '#4CAF50', // Emerald
        error: '#EF4444',
        warning: '#F59E0B',
        card: {
            background: 'rgba(255, 255, 255, 0.7)',
            border: 'rgba(255, 255, 255, 0.3)',
            shadow: 'rgba(0, 0, 0, 0.05)',
        },
        // Glass-specific colors
        glass: {
            emerald: 'rgba(76, 175, 80, 0.15)',
            emeraldHover: 'rgba(76, 175, 80, 0.25)',
            rim: 'rgba(255, 255, 255, 0.4)',
            rimHover: 'rgba(255, 255, 255, 0.6)',
        },
    },
    dark: {
        // Dark mode: Charcoal-based with emerald accents
        background: '#141414', // Dark background
        surface: '#1F1F1F', // Shiksha charcoal
        surfaceHighlight: '#292929', // Slightly lighter
        textPrimary: '#F2F2F2', // Near white
        textSecondary: '#9CA3AF', // Medium gray
        textTertiary: '#6B7280', // Darker gray
        primary: '#4CAF50', // Shiksha emerald
        primaryLight: 'rgba(76, 175, 80, 0.15)',
        border: '#333333', // Dark border
        success: '#4CAF50',
        error: '#EF4444',
        warning: '#F59E0B',
        card: {
            background: 'rgba(31, 31, 31, 0.8)',
            border: 'rgba(148, 163, 184, 0.1)',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
        // Glass-specific colors
        glass: {
            emerald: 'rgba(76, 175, 80, 0.1)',
            emeraldHover: 'rgba(76, 175, 80, 0.2)',
            rim: 'rgba(255, 255, 255, 0.1)',
            rimHover: 'rgba(255, 255, 255, 0.2)',
        },
    },
};

// Shiksha brand colors (constant across themes)
export const shikshaColors = {
    charcoal: '#1F1F1F',
    emerald: '#4CAF50',
    ivory: '#E5E1DD',
};

export type ThemeColors = typeof colors.light;
