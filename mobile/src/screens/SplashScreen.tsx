import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Brain, Zap, Terminal, GraduationCap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const MID_BG = '#1a2e33';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const footerFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Phase 1: Fade-in and scale logo
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 8,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        // Phase 2: Animate progress bar to ~35% and show footer
        const progressTimer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(progressAnim, {
                    toValue: 0.35,
                    duration: 1200,
                    useNativeDriver: false,
                }),
                Animated.timing(footerFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 400);

        // Phase 3: Complete progress bar and dismiss
        const finishProgressTimer = setTimeout(() => {
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: false,
            }).start();
        }, 1800);

        const dismissTimer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(onFinish);
        }, 2800);

        return () => {
            clearTimeout(progressTimer);
            clearTimeout(finishProgressTimer);
            clearTimeout(dismissTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <LinearGradient
            colors={[DARK_BG, MID_BG, DARK_BG]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            {/* Background glow blobs */}
            <View style={styles.blobTopLeft} />
            <View style={styles.blobBottomRight} />

            {/* Main logo + tagline */}
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
            >
                {/* Icon container */}
                <View style={styles.iconWrapper}>
                    <View style={styles.glowRing} />
                    <View style={styles.iconBox}>
                        <Brain size={48} color={PRIMARY} strokeWidth={1.5} />
                    </View>
                    {/* Badge */}
                    <View style={styles.badge}>
                        <Zap size={14} color={DARK_BG} fill={DARK_BG} />
                    </View>
                </View>

                {/* App name */}
                <Text style={styles.appName}>Sikhsha AI</Text>
                <Text style={styles.tagline}>Intelligent Teaching Assistant</Text>

                {/* Loading bar */}
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingHeader}>
                        <Text style={styles.loadingLabel}>Optimizing workspace...</Text>
                        <Animated.Text style={styles.loadingPercent}>
                            {progressAnim.interpolate({
                                inputRange: [0, 0.35, 1],
                                outputRange: ['0%', '35%', '100%'],
                            }) as any}
                        </Animated.Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                    </View>
                </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, { opacity: footerFadeAnim }]}>
                <Text style={styles.footerText}>POWERED BY ADVANCED AI</Text>
                <View style={styles.footerIcons}>
                    <Terminal size={16} color="#4b6367" />
                    <GraduationCap size={16} color="#4b6367" />
                    <Brain size={16} color="#4b6367" />
                </View>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    blobTopLeft: {
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(19, 200, 236, 0.04)',
    },
    blobBottomRight: {
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(19, 200, 236, 0.04)',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 24,
        width: '100%',
        maxWidth: 360,
    },
    iconWrapper: {
        width: 96,
        height: 96,
        marginBottom: 28,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    glowRing: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(19, 200, 236, 0.15)',
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(19, 200, 236, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(19, 200, 236, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: PRIMARY,
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
    },
    appName: {
        color: '#f1f5f9',
        fontSize: 40,
        fontWeight: '700',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 6,
    },
    tagline: {
        color: PRIMARY,
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 48,
    },
    loadingContainer: {
        width: width * 0.75,
        maxWidth: 280,
        gap: 8,
    },
    loadingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    loadingLabel: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '500',
    },
    loadingPercent: {
        color: PRIMARY,
        fontSize: 13,
        fontWeight: '700',
    },
    progressTrack: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: PRIMARY,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 3,
    },
    footer: {
        position: 'absolute',
        bottom: 48,
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        color: '#4b6367',
        fontSize: 10,
        fontWeight: '400',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    footerIcons: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 6,
    },
});

export default SplashScreen;
