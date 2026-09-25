import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import {
    Brain,
    BarChart3,
    GraduationCap,
    ArrowRight,
    BookOpen,
    Laptop,
    CheckCircle,
    Calendar,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const DARK_CARD = 'rgba(255,255,255,0.06)';
const DARK_BORDER = 'rgba(19, 200, 236, 0.15)';

type OnboardingNavProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

// ─── Slide 1 Icon ────────────────────────────────────────────────────────────
const Slide1Icon = () => (
    <View style={iconStyles.wrapper}>
        <View style={iconStyles.glow} />
        <View style={iconStyles.brainOuter}>
            <Brain size={72} color={PRIMARY} strokeWidth={1.2} />
        </View>
    </View>
);

// ─── Slide 2 Icon ────────────────────────────────────────────────────────────
const Slide2Icon = () => (
    <View style={iconStyles.wrapper}>
        <View style={iconStyles.glow} />
        <View style={iconStyles.mgmtOuter}>
            <BarChart3 size={56} color={PRIMARY} strokeWidth={1.3} />
            {/* Mini indicator cards */}
            <View style={iconStyles.mgmtCards}>
                <View style={iconStyles.miniCard}>
                    <CheckCircle size={14} color={PRIMARY} />
                    <View style={iconStyles.miniLine} />
                </View>
                <View style={iconStyles.miniCard}>
                    <Calendar size={14} color={PRIMARY} />
                    <View style={[iconStyles.miniLine, { width: 36 }]} />
                </View>
            </View>
        </View>
    </View>
);

// ─── Slide 3 Icon ────────────────────────────────────────────────────────────
const Slide3Icon = () => (
    <View style={iconStyles.wrapper}>
        <View style={iconStyles.glow} />
        <View style={iconStyles.classOuter}>
            <GraduationCap size={72} color={PRIMARY} strokeWidth={1.2} />
            <View style={iconStyles.subIcons}>
                <BookOpen size={28} color={`${PRIMARY}99`} />
                <Laptop size={28} color={`${PRIMARY}99`} />
            </View>
        </View>
    </View>
);

const slides = [
    {
        id: '1',
        title: 'AI-Powered Learning',
        description:
            'Unlock the power of AI to generate lesson plans, quizzes, and study cards in seconds.',
        icon: <Slide1Icon />,
    },
    {
        id: '2',
        title: 'Effortless Management',
        description:
            'Track student progress, manage attendance, and handle administrative tasks with one tap.',
        icon: <Slide2Icon />,
    },
    {
        id: '3',
        title: 'Modern Classroom',
        description:
            'Bring your classroom to the 21st century with tools designed for teachers and students.',
        icon: <Slide3Icon />,
    },
];

// ─── Dot indicator ───────────────────────────────────────────────────────────
const PaginationDots = ({ count, activeIndex }: { count: number; activeIndex: number }) => (
    <View style={styles.paginationRow}>
        {Array.from({ length: count }).map((_, i) => (
            <View
                key={i}
                style={[
                    styles.dot,
                    i === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
            />
        ))}
    </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
const OnboardingScreen: React.FC = () => {
    const navigation = useNavigation<OnboardingNavProp>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const isLast = currentIndex === slides.length - 1;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (!isLast) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            navigation.replace('Login');
        }
    };

    const handleSkip = () => {
        navigation.replace('Login');
    };

    const renderSlide = ({ item }: { item: typeof slides[0] }) => (
        <View style={styles.slide}>
            {/* Illustration container */}
            <View style={styles.illustrationBox}>
                <LinearGradient
                    colors={['rgba(19,200,236,0.12)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                {item.icon}
            </View>

            {/* Text */}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <LinearGradient
            colors={[DARK_BG, '#0d1a1d', DARK_BG]}
            style={styles.screen}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

            {/* Background blobs */}
            <View style={styles.blobTL} />
            <View style={styles.blobBR} />

            {/* Skip button */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={item => item.id}
                style={{ flex: 1 }}
            />

            {/* Footer */}
            <View style={styles.footer}>
                <PaginationDots count={slides.length} activeIndex={currentIndex} />

                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[PRIMARY, '#0db8d9']}
                        style={styles.btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.btnText}>{isLast ? 'Get Started' : 'Next'}</Text>
                        <ArrowRight size={20} color={DARK_BG} strokeWidth={2.5} />
                    </LinearGradient>
                </TouchableOpacity>

                {isLast && (
                    <Text style={styles.joinText}>Join 10,000+ modern educators today.</Text>
                )}
            </View>
        </LinearGradient>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    blobTL: {
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: 'rgba(19, 200, 236, 0.04)',
    },
    blobBR: {
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: width * 0.65,
        height: width * 0.65,
        borderRadius: width * 0.325,
        backgroundColor: 'rgba(19, 200, 236, 0.04)',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    skipBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    skipText: {
        color: PRIMARY,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    slide: {
        width,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    illustrationBox: {
        width: width - 48,
        aspectRatio: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: DARK_BORDER,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        overflow: 'hidden',
    },
    title: {
        color: '#f1f5f9',
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 14,
    },
    description: {
        color: '#94a3b8',
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'center',
        maxWidth: 320,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
        alignItems: 'center',
        gap: 20,
    },
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 28,
        backgroundColor: PRIMARY,
    },
    dotInactive: {
        width: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    primaryBtn: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    btnText: {
        color: DARK_BG,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    joinText: {
        color: '#64748b',
        fontSize: 13,
        textAlign: 'center',
    },
});

// ─── Icon styles ──────────────────────────────────────────────────────────────
const iconStyles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    glow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(19, 200, 236, 0.08)',
    },
    // Slide 1
    brainOuter: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(19, 200, 236, 0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(19, 200, 236, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Slide 2
    mgmtOuter: {
        alignItems: 'center',
        gap: 20,
    },
    mgmtCards: {
        flexDirection: 'row',
        gap: 12,
    },
    miniCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: DARK_CARD,
        borderWidth: 1,
        borderColor: DARK_BORDER,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    miniLine: {
        height: 6,
        width: 52,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    // Slide 3
    classOuter: {
        alignItems: 'center',
        gap: 16,
    },
    subIcons: {
        flexDirection: 'row',
        gap: 24,
    },
});

export default OnboardingScreen;
