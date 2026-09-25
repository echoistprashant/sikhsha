
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    FlatList,
    Dimensions,
    Modal,
    TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TeacherStackParamList } from '../../navigation/TeacherNavigator';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { getDeckById, deleteDeck, refineDeck } from '../../api/teacherApi';
import type { DeckWithSlides } from '../../api/teacherApi';
import { logger } from '../../utils/logger';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import { generatePDF, sharePDF } from '../../utils/pdfService';

type DeckDetailRouteProp = RouteProp<TeacherStackParamList, 'DeckDetail'>;

const DeckDetailScreen: React.FC = () => {
    const route = useRoute<DeckDetailRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
    const { token } = useAuth();
    const { deckId } = route.params;

    const [deck, setDeck] = useState<DeckWithSlides | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingPDF, setSavingPDF] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refine with AI state
    const [showRefineModal, setShowRefineModal] = useState(false);
    const [refineFeedback, setRefineFeedback] = useState('');
    const [refining, setRefining] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    useEffect(() => {
        if (!token || !deckId) {
            return;
        }

        let cancelled = false;

        const fetchDeck = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getDeckById(token, deckId);
                if (!cancelled) {
                    setDeck(data);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || 'Failed to load deck');
                    logger.error('Failed to fetch deck', { deckId, error: err.message });
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchDeck();

        return () => {
            cancelled = true;
        };
    }, [token, deckId]);

    const handleDelete = () => {
        if (!deck) return;

        Alert.alert(
            'Delete Deck',
            `Are you sure you want to delete "${deck.title}" ? This cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!deckId) return;
                        try {
                            await deleteDeck(token!, deckId);

                            Toast.show({
                                type: 'success',
                                text1: 'Deleted',
                                text2: 'Deck deleted successfully',
                            });
                            navigation.goBack();
                        } catch (err: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: err.message || 'Failed to delete deck',
                            });
                        }
                    },
                },
            ],
        );
    };



    const handleSavePDF = async () => {
        if (!deck) return;

        setSavingPDF(true);
        try {
            // Generate HTML
            const slidesHtml = deck.slides.map((slide, index) => `
                <div class="slide">
                    <div class="slide-header">
                        <span class="slide-number">Slide ${index + 1}</span>
                        <h2>${slide.title}</h2>
                    </div>
                    <div class="slide-content">
                        ${slide.content.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <div class="page-break"></div>
            `).join('');

            const html = `
                <html>
                <head>
                    <style>
                        body { font-family: Helvetica, sans-serif; padding: 40px; }
                        h1 { color: #a855f7; text-align: center; margin-bottom: 10px; }
                        .meta { text-align: center; color: #666; margin-bottom: 40px; }
                        .slide { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
                        .slide-header { border-bottom: 2px solid #a855f7; padding-bottom: 10px; margin-bottom: 15px; display: flex; align-items: center; }
                        .slide-number { background: #a855f7; color: white; padding: 5px 10px; border-radius: 12px; font-size: 12px; margin-right: 10px; font-weight: bold; }
                        .slide-content { line-height: 1.6; color: #333; }
                        .page-break { page-break-after: always; }
                    </style>
                </head>
                <body>
                    <h1>${deck.title}</h1>
                    <div class="meta">
                        <p>Subject: ${deck.subject} • Grade: ${deck.grade_level}</p>
                        <p>Generated by Sikhsha AI</p>
                    </div>
                    ${slidesHtml}
                </body>
                </html>
            `;

            const fileName = `Deck_${deck.title.replace(/[^a-z0-9]/gi, '_')}`;
            const filePath = await generatePDF({ html, fileName });

            if (filePath) {
                await sharePDF(filePath, fileName);
                Toast.show({
                    type: 'success',
                    text1: 'PDF Ready',
                    text2: 'Sharing PDF...',
                });
            }
        } catch (err: any) {
            logger.error('Failed to generate PDF', { error: err.message });
            Toast.show({
                type: 'error',
                text1: 'PDF Error',
                text2: err.message || 'Failed to generate PDF',
            });
        } finally {
            setSavingPDF(false);
        }
    };

    const handleRefine = async () => {
        if (!deck || !token || !deckId) return;
        if (!refineFeedback.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Feedback Required',
                text2: 'Please describe the changes you want to make',
            });
            return;
        }

        setRefining(true);
        try {
            // Call the refine API with just the feedback
            await refineDeck(token, deckId, refineFeedback.trim());

            // Re-fetch the updated deck from server
            const updatedDeck = await getDeckById(token, deckId);
            setDeck(updatedDeck);

            setShowRefineModal(false);
            setRefineFeedback('');
            setCurrentSlideIndex(0);

            Toast.show({
                type: 'success',
                text1: 'Deck Refined!',
                text2: 'Your deck has been updated with the changes',
                visibilityTime: 3000,
            });

            logger.info('Deck refined successfully', { deckId, feedback: refineFeedback });
        } catch (err: any) {
            logger.error('Failed to refine deck', { error: err.message });
            Toast.show({
                type: 'error',
                text1: 'Refinement Failed',
                text2: err.message || 'Could not refine the deck. Please try again.',
                visibilityTime: 5000,
            });
        } finally {
            setRefining(false);
        }
    };

    const handleNext = () => {
        if (deck && currentSlideIndex < deck.slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentSlideIndex + 1,
                animated: true
            });
        }
    };

    const handlePrev = () => {
        if (currentSlideIndex > 0) {
            flatListRef.current?.scrollToIndex({
                index: currentSlideIndex - 1,
                animated: true
            });
        }
    };

    const renderSlide = ({ item, index }: { item: any, index: number }) => (
        <View style={styles.slideContainer}>
            <GlassCard style={styles.slideCard}>
                <View style={styles.slideHeader}>
                    <View style={styles.slideNumberBadge}>
                        <Text style={styles.slideNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.slideTitle}>{item.title}</Text>
                </View>
                <ScrollView style={styles.slideContentScroll}>
                    <Text style={styles.slideContent}>{item.content}</Text>
                </ScrollView>
            </GlassCard>
        </View>
    );

    if (!token) {
        return (
            <GlassScreen>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Sign in required</Text>
                    <Text style={styles.loadingText}>
                        Please log in to view deck details.
                    </Text>
                </View>
            </GlassScreen>
        );
    }

    if (loading) {
        return (
            <GlassScreen>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text style={styles.loadingText}>Loading deck...</Text>
                </View>
            </GlassScreen>
        );
    }

    if (error || !deck) {
        return (
            <GlassScreen>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'Deck not found'}</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </GlassScreen>
        );
    }

    return (
        <GlassScreen>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {deck.title}
                </Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => setShowRefineModal(true)}
                        style={[styles.iconButton, styles.refineButton]}>
                        <Text style={styles.iconButtonText}>✨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSavePDF} style={styles.iconButton}>
                        <Text style={styles.iconButtonText}>📄</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, styles.deleteButton]}>
                        <Text style={styles.iconButtonText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.deckInfoBar}>
                <Text style={styles.deckInfoText}>{deck.subject} • Grade {deck.grade_level}</Text>
                <Text style={styles.slideCounter}>
                    Slide {currentSlideIndex + 1} of {deck.slides.length}
                </Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={deck.slides}
                renderItem={renderSlide}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                    setCurrentSlideIndex(index);
                }}
                getItemLayout={(_, index) => ({
                    length: Dimensions.get('window').width,
                    offset: Dimensions.get('window').width * index,
                    index,
                })}
            />

            <View style={styles.navigationControls}>
                <TouchableOpacity
                    onPress={handlePrev}
                    disabled={currentSlideIndex === 0}
                    style={[styles.navButton, currentSlideIndex === 0 && styles.navButtonDisabled]}>
                    <Text style={styles.navButtonText}>← Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!deck || currentSlideIndex === (deck.slides?.length || 0) - 1}
                    style={[styles.navButton, (!deck || currentSlideIndex === (deck.slides?.length || 0) - 1) && styles.navButtonDisabled]}>
                    <Text style={styles.navButtonText}>Next →</Text>
                </TouchableOpacity>
            </View>

            {/* Refine with AI Modal */}
            <Modal
                visible={showRefineModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowRefineModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>✨ Refine with AI</Text>
                            <TouchableOpacity onPress={() => setShowRefineModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.modalSubtitle}>
                                Describe the changes you want to make to this deck:
                            </Text>
                            <TextInput
                                style={styles.feedbackInput}
                                placeholder="e.g., Add more examples, simplify the explanations, add a slide about applications..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                multiline
                                numberOfLines={4}
                                value={refineFeedback}
                                onChangeText={setRefineFeedback}
                                editable={!refining}
                            />

                            <View style={styles.modalExamples}>
                                <Text style={styles.examplesTitle}>Example requests:</Text>
                                <Text style={styles.exampleItem}>• "Add more real-world applications"</Text>
                                <Text style={styles.exampleItem}>• "Simplify the mathematical derivations"</Text>
                                <Text style={styles.exampleItem}>• "Add more practice problems"</Text>
                                <Text style={styles.exampleItem}>• "Include historical context"</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.refineSubmitButton, refining && styles.buttonDisabled]}
                                onPress={handleRefine}
                                disabled={refining || !refineFeedback.trim()}>
                                {refining ? (
                                    <View style={styles.refiningRow}>
                                        <ActivityIndicator color="#fff" size="small" />
                                        <Text style={styles.refineSubmitText}>Refining deck...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.refineSubmitText}>✨ Refine Deck</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </GlassScreen>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#e2e8f0',
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerButton: {
        padding: 8,
    },
    headerButtonText: {
        color: '#a855f7',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    iconButtonText: {
        fontSize: 16,
    },
    deckInfoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    deckInfoText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    slideCounter: {
        color: '#e2e8f0',
        fontSize: 12,
        fontWeight: '600',
    },
    slideContainer: {
        width: width,
        flex: 1,
        padding: 16,
        paddingBottom: 80, // Space for nav controls
        justifyContent: 'center',
    },
    slideCard: {
        flex: 1,
        padding: 0,
        overflow: 'hidden',
    },
    slideHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
    },
    slideNumberBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#a855f7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    slideNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    slideTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    slideContentScroll: {
        flex: 1,
        padding: 20,
    },
    slideContent: {
        color: '#e2e8f0',
        fontSize: 18,
        lineHeight: 28,
    },
    navigationControls: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    navButton: {
        backgroundColor: 'rgba(168, 85, 247, 0.9)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    navButtonDisabled: {
        backgroundColor: 'rgba(168, 85, 247, 0.3)',
        elevation: 0,
    },
    navButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    // Refine with AI styles
    refineButton: {
        backgroundColor: 'rgba(168, 85, 247, 0.3)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 10, 30, 0.95)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0f0a1e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        borderBottomWidth: 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalClose: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.6)',
        padding: 4,
    },
    modalBody: {
        padding: 20,
    },
    modalSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 16,
    },
    feedbackInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 16,
    },
    modalExamples: {
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    examplesTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#a855f7',
        marginBottom: 8,
    },
    exampleItem: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 4,
    },
    refineSubmitButton: {
        backgroundColor: '#a855f7',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    refiningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    refineSubmitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default DeckDetailScreen;
