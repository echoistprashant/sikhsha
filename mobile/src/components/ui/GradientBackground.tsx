import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'dark' | 'light' | 'emerald';
}

/**
 * GradientBackground - Background gradient with Shiksha theme colors
 */
const GradientBackground: React.FC<Props> = ({
    children,
    style,
    variant = 'dark',
}) => {
    const getGradientColors = () => {
        switch (variant) {
            case 'light':
                // Warm ivory gradient for light mode
                return ['#E5E1DD', '#F5F3F0', '#E5E1DD'];
            case 'emerald':
                // Subtle emerald-tinted gradient
                return ['#141414', 'rgba(76, 175, 80, 0.08)', '#0d0d0d'];
            case 'dark':
            default:
                // Shiksha charcoal gradient
                return ['#141414', '#1F1F1F', '#0d0d0d'];
        }
    };

    return (
        <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, style]}>
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default GradientBackground;
