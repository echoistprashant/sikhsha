import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import GlassDropdown from '../../components/GlassDropdown';
import GlassButton from '../../components/GlassButton';
import { useTheme } from '../../context/ThemeContext';
import { request } from '../../api/httpClient';
import { useAuth } from '../../context/AuthContext';
import { logger } from '../../utils/logger';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import { generatePDF, sharePDF } from '../../utils/pdfService';

interface Chapter {
    name: string;
    topics?: { name: string; subtopics?: string[] }[];
}

interface Topic {
    name: string;
    subtopics?: string[];
}

interface Slide {
    id: string;
    title: string;
    content: string;
    order: number;
}

interface Deck {
    id: string;
    title: string;
    subject: string;
    grade_level: string;
    slides: Slide[];
}

const CLASS_OPTIONS = ['8', '9', '10', '11', '12'];

export const DeckGeneratorScreen = () => {
    const navigation = useNavigation();
    const { token } = useAuth();

    // Curriculum selection state
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    // API data
    const [subjects, setSubjects] = useState<string[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);

    // Loading states
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    // UI state
    const [generatedDeck, setGeneratedDeck] = useState<Deck | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load subjects when class changes
    useEffect(() => {
        if (selectedClass && token) {
            setLoadingSubjects(true);
            setSelectedSubject('');
            setSelectedChapter('');
            setSelectedTopics([]);
            setChapters([]);
            setTopics([]);

            request<string[]>(`/curriculum/${selectedClass}/subjects`, { token })
                .then(data => {
                    setSubjects(data || []);
                })
                .catch(err => {
                    logger.error('Failed to fetch subjects', { error: err.message });
                    setSubjects([]);
                })
                .finally(() => setLoadingSubjects(false));
        }
    }, [selectedClass, token]);

    // Load chapters when subject changes
    useEffect(() => {
        if (selectedClass && selectedSubject && token) {
            setLoadingChapters(true);
            setSelectedChapter('');
            setSelectedTopics([]);
            setTopics([]);

            request<Chapter[]>(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/chapters`, { token })
                .then(data => {
                    setChapters(data || []);
                })
                .catch(err => {
                    logger.error('Failed to fetch chapters', { error: err.message });
                    setChapters([]);
                })
                .finally(() => setLoadingChapters(false));
        }
    }, [selectedClass, selectedSubject, token]);

    // Load topics when chapter changes
    useEffect(() => {
        if (selectedClass && selectedSubject && selectedChapter && token) {
            setLoadingTopics(true);
            setSelectedTopics([]);

            request<Topic[]>(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(selectedChapter)}/topics`, { token })
                .then(data => {
                    setTopics(data || []);
                })
                .catch(err => {
                    logger.error('Failed to fetch topics', { error: err.message });
                    setTopics([]);
                })
                .finally(() => setLoadingTopics(false));
        }
    }, [selectedClass, selectedSubject, selectedChapter, token]);

    const toggleTopic = (topicName: string) => {
        setSelectedTopics(prev =>
            prev.includes(topicName)
                ? prev.filter(t => t !== topicName)
                : [...prev, topicName]
        );
    };

    const canGenerate = selectedClass && selectedSubject && selectedChapter && selectedTopics.length > 0;
    const estimatedSlides = selectedTopics.length * 5 + 1;

    const handleGenerate = async () => {
        if (!token || !canGenerate) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select class, subject, chapter, and at least one topic',
            });
            return;
        }

        setGenerating(true);
        setError(null);
        setGeneratedDeck(null);

        try {
            // Match frontend payload exactly
            const payload = {
                topics: selectedTopics,
                subject: selectedSubject,
                gradeLevel: selectedClass,
                chapter: selectedChapter,
            };

            logger.info('Generating deck', payload);

            const deck = await request<Deck>('/teacher/deck/generate', {
                method: 'POST',
                token,
                body: payload,
            });

            setGeneratedDeck(deck);

            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: `Generated ${deck.slides?.length || 0} slides for ${selectedTopics.length} topic(s)`,
                visibilityTime: 3000,
            });

            logger.info('Deck generated successfully', { title: deck.title, slides: deck.slides?.length });
        } catch (err: any) {
            logger.error('Deck generation failed', { error: err.message });
            setError(err.message || 'Failed to generate deck');
            Toast.show({
                type: 'error',
                text1: 'Generation Failed',
                text2: err.message || 'Please try again',
                visibilityTime: 5000,
            });
        } finally {
            setGenerating(false);
        }
    };


    const handleSharePDF = async () => {
        if (!generatedDeck) {
            Toast.show({
                type: 'error',
                text1: 'No Deck',
                text2: 'Generate a deck first before saving to PDF',
            });
            return;
        }

        setGeneratingPDF(true);

        try {
            // Generate HTML content for the deck
            const slidesHtml = generatedDeck.slides?.map((slide, index) => `
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
            `).join('') || '';

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
                    <h1>${generatedDeck.title}</h1>
                    <div class="meta">
                        <p>Subject: ${generatedDeck.subject} • Grade: ${generatedDeck.grade_level}</p>
                        <p>Generated by Sikhsha AI</p>
                    </div>
                    ${slidesHtml}
                </body>
                </html>
            `;

            const fileName = `Deck_${generatedDeck.title.replace(/[^a-z0-9]/gi, '_')}`;
            const filePath = await generatePDF({ html, fileName });

            if (filePath) {
                await sharePDF(filePath, fileName);
                Toast.show({
                    type: 'success',
                    text1: 'PDF Ready',
                    text2: 'Sharing deck PDF...',
                });
            }
        } catch (err: any) {
            logger.error('PDF generation failed', { error: err.message });
            Toast.show({
                type: 'error',
                text1: 'PDF Failed',
                text2: err.message || 'Could not generate PDF',
                visibilityTime: 5000,
            });
        } finally {
            setGeneratingPDF(false);
        }
    };

    return (
        <GlassScreen>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.headerTitle}>Teaching Deck Generator</Text>
                <Text style={styles.headerSubtitle}>
                    Create structured teaching decks from your curriculum topics
                </Text>

                <GlassCard style={styles.formCard}>
                    {/* Class Selection */}
                    <GlassDropdown
                        label="Class *"
                        placeholder="Select class..."
                        options={CLASS_OPTIONS.map(c => ({ value: c, label: `Class ${c}` }))}
                        value={selectedClass}
                        onSelect={setSelectedClass}
                        disabled={generating}
                    />

                    {/* Subject Selection */}
                    <GlassDropdown
                        label="Subject *"
                        placeholder="Select subject..."
                        options={subjects.map(s => ({ value: s, label: s }))}
                        value={selectedSubject}
                        onSelect={setSelectedSubject}
                        disabled={!selectedClass || generating}
                        loading={loadingSubjects}
                    />

                    {/* Chapter Selection */}
                    <GlassDropdown
                        label="Chapter *"
                        placeholder="Select chapter..."
                        options={chapters.map(c => ({ value: c.name, label: c.name }))}
                        value={selectedChapter}
                        onSelect={setSelectedChapter}
                        disabled={!selectedSubject || generating}
                        loading={loadingChapters}
                    />

                    {/* Topics Multi-Select */}
                    <Text style={styles.label}>
                        Topics <Text style={styles.required}>*</Text>
                        <Text style={styles.hint}> (select multiple)</Text>
                    </Text>
                    {loadingTopics ? (
                        <View style={styles.topicsLoading}>
                            <ActivityIndicator size="small" color="#4CAF50" />
                            <Text style={styles.loadingText}>Loading topics...</Text>
                        </View>
                    ) : topics.length > 0 ? (
                        <View style={styles.topicsContainer}>
                            {topics.map(topic => (
                                <TouchableOpacity
                                    key={topic.name}
                                    style={[
                                        styles.topicItem,
                                        selectedTopics.includes(topic.name) && styles.topicItemSelected
                                    ]}
                                    onPress={() => toggleTopic(topic.name)}
                                    disabled={generating}>
                                    <View style={[
                                        styles.checkbox,
                                        selectedTopics.includes(topic.name) && styles.checkboxSelected
                                    ]}>
                                        {selectedTopics.includes(topic.name) && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.topicText,
                                        selectedTopics.includes(topic.name) && styles.topicTextSelected
                                    ]}>
                                        {topic.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : selectedChapter ? (
                        <Text style={styles.noData}>No topics found</Text>
                    ) : (
                        <Text style={styles.noData}>Select a chapter first</Text>
                    )}

                    {selectedTopics.length > 0 && (
                        <Text style={styles.slideEstimate}>
                            {selectedTopics.length} topic(s) selected → {estimatedSlides} slides
                        </Text>
                    )}

                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={{ marginTop: 24 }}>
                        <GlassButton
                            title={generating ? "Generating..." : "Generate Deck"}
                            onPress={handleGenerate}
                            disabled={generating || !canGenerate}
                            variant="secondary"
                            size="lg"
                            loading={generating}
                        />
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>Deck Structure (per topic):</Text>
                        <Text style={styles.infoItem}>1. Definition</Text>
                        <Text style={styles.infoItem}>2. Details & Explanation</Text>
                        <Text style={styles.infoItem}>3. Basic Question</Text>
                        <Text style={styles.infoItem}>4. Numerical/Hard Question</Text>
                        <Text style={styles.infoItem}>5. Olympiad-level Question</Text>
                        <Text style={styles.infoFooter}>+ Final Summary Slide</Text>
                    </View>
                </GlassCard>

                {/* Results Display */}
                {generatedDeck && (
                    <GlassCard style={styles.resultCard}>
                        <Text style={styles.resultTitle}>{generatedDeck.title}</Text>
                        <Text style={styles.resultSubtitle}>
                            ✓ Generated successfully • {generatedDeck.slides?.length || 0} slides
                        </Text>

                        <ScrollView style={styles.slidesContainer} nestedScrollEnabled={true}>
                            {generatedDeck.slides?.map((slide, index) => (
                                <View key={slide.id || index} style={styles.slideItem}>
                                    <View style={styles.slideNumber}>
                                        <Text style={styles.slideNumberText}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.slideContent}>
                                        <Text style={styles.slideTitle}>{slide.title}</Text>
                                        <Text style={styles.slideBody}>
                                            {slide.content}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.pdfButton, generatingPDF && styles.buttonDisabled]}
                            onPress={handleSharePDF}
                            disabled={generatingPDF}>
                            {generatingPDF ? (
                                <ActivityIndicator color="#10b981" />
                            ) : (
                                <Text style={styles.pdfButtonText}>Save to PDF 📄</Text>
                            )}
                        </TouchableOpacity>
                    </GlassCard>
                )}

            </ScrollView>
        </GlassScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
    },
    formCard: {
        padding: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
        marginTop: 12,
    },
    required: {
        color: '#ef4444',
    },
    hint: {
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '400',
    },
    dropdown: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownDisabled: {
        opacity: 0.5,
    },
    dropdownText: {
        color: '#fff',
        fontSize: 16,
    },
    dropdownTextDisabled: {
        color: 'rgba(255,255,255,0.5)',
    },
    dropdownArrow: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    topicsContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        maxHeight: 200,
    },
    topicsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    topicItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    topicItemSelected: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: 6,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    checkmark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    topicText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        flex: 1,
    },
    topicTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    noData: {
        color: 'rgba(255,255,255,0.5)',
        padding: 16,
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    slideEstimate: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 12,
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderRadius: 8,
        padding: 16,
        marginTop: 24,
        marginBottom: 20,
    },
    infoTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    infoItem: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginBottom: 4,
    },
    infoFooter: {
        color: '#60a5fa',
        fontSize: 13,
        marginTop: 4,
    },
    resultCard: {
        padding: 20,
        marginTop: 10,
    },
    resultTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: 4,
    },
    resultSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 16,
    },
    slidesContainer: {
        maxHeight: 400,
    },
    slideItem: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginBottom: 8,
    },
    slideNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    slideNumberText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: 'bold',
    },
    slideContent: {
        flex: 1,
    },
    slideTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    slideBody: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 18,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1f2937',
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
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalClose: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.6)',
        padding: 4,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.6)',
        marginLeft: 12,
    },
    optionsList: {
        padding: 8,
    },
    optionItem: {
        padding: 16,
        borderRadius: 8,
        marginVertical: 2,
    },
    optionItemSelected: {
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
    },
    optionText: {
        fontSize: 16,
        color: '#fff',
    },
    optionTextSelected: {
        color: '#60a5fa',
        fontWeight: 'bold',
    },
    pdfButton: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    pdfButtonText: {
        color: '#10b981',
        fontSize: 15,
        fontWeight: '600',
    },
});
