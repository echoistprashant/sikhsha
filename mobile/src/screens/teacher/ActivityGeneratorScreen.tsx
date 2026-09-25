import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassView } from '../../components/GlassView';
import GlassCard from '../../components/GlassCard';
import GlassScreen from '../../components/GlassScreen';
import GlassDropdown from '../../components/GlassDropdown';
import GlassInput from '../../components/GlassInput';
import GlassButton from '../../components/GlassButton';
import { useTheme } from '../../context/ThemeContext';
import { generateActivity, QuizQuestion } from '../../api/teacherApi';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../api/httpClient';
import { logger } from '../../utils/logger';
import Toast from 'react-native-toast-message';

// Curriculum Types
interface Chapter {
    name: string;
    topics?: { name: string }[];
}

interface Topic {
    name: string;
}

const CLASS_OPTIONS = ['8', '9', '10', '11', '12'];

export const ActivityGeneratorScreen = () => {
    const navigation = useNavigation();
    const { token } = useAuth();

    // Mode: 'setup' | 'quiz'
    const [mode, setMode] = useState<'setup' | 'quiz'>('setup');

    // Setup State
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>(''); // Can be from dropdown or text

    // Data for pickers
    const [subjects, setSubjects] = useState<string[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);

    // Loading States
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Quiz State
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({}); // questionId -> selectedOption
    const [showExplanation, setShowExplanation] = useState(false);

    // Curriculum Fetching Effects
    useEffect(() => {
        if (selectedClass && token) {
            setLoadingSubjects(true);
            setSelectedSubject('');
            setSelectedChapter('');
            setSelectedTopic('');
            request<string[]>(`/curriculum/${selectedClass}/subjects`, { token })
                .then(data => setSubjects(data || []))
                .catch(err => logger.error('Failed to fetch subjects', err))
                .finally(() => setLoadingSubjects(false));
        }
    }, [selectedClass, token]);

    useEffect(() => {
        if (selectedClass && selectedSubject && token) {
            setLoadingChapters(true);
            setSelectedChapter('');
            setSelectedTopic('');
            request<Chapter[]>(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/chapters`, { token })
                .then(data => setChapters(data || []))
                .catch(err => logger.error('Failed to fetch chapters', err))
                .finally(() => setLoadingChapters(false));
        }
    }, [selectedClass, selectedSubject, token]);

    useEffect(() => {
        if (selectedClass && selectedSubject && selectedChapter && token) {
            setLoadingTopics(true);
            setSelectedTopic('');
            request<Topic[]>(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(selectedChapter)}/topics`, { token })
                .then(data => setTopics(data || []))
                .catch(err => logger.error('Failed to fetch topics', err))
                .finally(() => setLoadingTopics(false));
        }
    }, [selectedClass, selectedSubject, selectedChapter, token]);

    // Start Quiz
    const handleStartSession = async () => {
        if (!selectedClass || !selectedSubject || !selectedChapter || !selectedTopic) {
            Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please select all fields.' });
            return;
        }

        setGenerating(true);
        try {
            const response = await generateActivity(token!, {
                classLevel: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                topic: selectedTopic,
                count: 5
            });

            if (response.questions && response.questions.length > 0) {
                setQuestions(response.questions);
                setMode('quiz');
                setCurrentIndex(0);
                setAnswers({});
                setShowExplanation(false);
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: 'No questions generated.' });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Failed', text2: error.message || 'Could not start session.' });
        } finally {
            setGenerating(false);
        }
    };

    // Auto-fetch more questions
    const fetchMoreQuestions = async () => {
        try {
            const response = await generateActivity(token!, {
                classLevel: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                topic: selectedTopic,
                count: 2
            });
            if (response.questions.length > 0) {
                // Append new questions, filtering duplicates if any
                setQuestions(prev => {
                    const existingIds = new Set(prev.map(q => q.id));
                    const newQs = response.questions.filter(q => !existingIds.has(q.id));
                    return [...prev, ...newQs];
                });
                Toast.show({ type: 'success', text1: 'New questions added!', visibilityTime: 2000 });
            }
        } catch (err) {
            logger.error('Failed to auto-fetch questions', err);
        }
    };

    const handleAnswerSelect = (option: string) => {
        if (answers[questions[currentIndex].id]) return; // Already answered

        setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: option }));
        setShowExplanation(true);

        const answeredCount = Object.keys(answers).length + 1;
        // Trigger fetch more if every 2 questions
        if (answeredCount % 2 === 0) {
            fetchMoreQuestions();
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowExplanation(!!answers[questions[currentIndex + 1]?.id]);
        }
    };

    const endSession = () => {
        Alert.alert('End Session', 'Are you sure you want to end this quiz?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'End', style: 'destructive', onPress: () => setMode('setup') }
        ]);
    };

    if (mode === 'quiz') {
        const currentQ = questions[currentIndex];
        const userAnswer = answers[currentQ?.id];
        const isAnswered = !!userAnswer;
        const isCorrect = userAnswer === currentQ?.answer;

        return (
            <GlassScreen>
                <View style={styles.quizHeader}>
                    <TouchableOpacity onPress={endSession} style={styles.endButton}>
                        <Text style={styles.endButtonText}>End Session</Text>
                    </TouchableOpacity>
                    <Text style={styles.progressText}>{currentIndex + 1} / {questions.length}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.container}>
                    {currentQ ? (
                        <GlassCard style={styles.questionCard}>
                            <Text style={styles.questionText}>{currentQ.content}</Text>

                            <View style={styles.optionsContainer}>
                                {currentQ.options?.map((opt, idx) => {
                                    const isSelected = userAnswer === opt;
                                    const isCorrectOpt = opt === currentQ.answer;

                                    let optionStyle = styles.optionButton;
                                    if (isAnswered) {
                                        if (isCorrectOpt) optionStyle = styles.optionCorrect;
                                        else if (isSelected) optionStyle = styles.optionWrong;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            style={optionStyle}
                                            onPress={() => handleAnswerSelect(opt)}
                                            disabled={isAnswered}
                                        >
                                            <Text style={styles.optionBtnText}>{opt}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {isAnswered && (
                                <View style={styles.feedbackContainer}>
                                    <Text style={[styles.feedbackTitle, { color: isCorrect ? '#10b981' : '#ef4444' }]}>
                                        {isCorrect ? 'Correct!' : 'Incorrect'}
                                    </Text>
                                    <Text style={styles.explanationText}>{currentQ.explanation}</Text>

                                    {currentIndex < questions.length - 1 && (
                                        <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
                                            <Text style={styles.buttonText}>Next Question →</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </GlassCard>
                    ) : (
                        <ActivityIndicator color="#fff" />
                    )}
                </ScrollView>
            </GlassScreen>
        );
    }

    return (
        <GlassScreen>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.headerTitle}>Interactive Quiz Session</Text>
                <Text style={styles.headerSubtitle}>Start a live AI-generated quiz session</Text>

                <GlassCard style={styles.formCard}>
                    <GlassDropdown
                        label="Class"
                        placeholder="Select Class"
                        options={CLASS_OPTIONS.map(c => ({ value: c, label: `Class ${c}` }))}
                        value={selectedClass}
                        onSelect={setSelectedClass}
                    />

                    <GlassDropdown
                        label="Subject"
                        placeholder="Select Subject"
                        options={subjects.map(s => ({ value: s, label: s }))}
                        value={selectedSubject}
                        onSelect={setSelectedSubject}
                        disabled={!selectedClass}
                        loading={loadingSubjects}
                    />

                    <GlassDropdown
                        label="Chapter"
                        placeholder="Select Chapter"
                        options={chapters.map(c => ({ value: c.name, label: c.name }))}
                        value={selectedChapter}
                        onSelect={setSelectedChapter}
                        disabled={!selectedSubject}
                        loading={loadingChapters}
                    />

                    {topics.length > 0 ? (
                        <GlassDropdown
                            label="Topic"
                            placeholder="Select Topic"
                            options={topics.map(t => ({ value: t.name, label: t.name }))}
                            value={selectedTopic}
                            onSelect={setSelectedTopic}
                            disabled={!selectedChapter}
                            loading={loadingTopics}
                        />
                    ) : (
                        <GlassInput
                            label="Topic"
                            placeholder="Enter Topic"
                            value={selectedTopic}
                            onChangeText={setSelectedTopic}
                            editable={!!selectedChapter}
                        />
                    )}

                    <View style={{ marginTop: 16 }}>
                        <GlassButton
                            title={generating ? "Starting..." : "Start Interactive Session"}
                            onPress={handleStartSession}
                            disabled={generating}
                            variant="secondary"
                            size="lg"
                            loading={generating}
                        />
                    </View>
                </GlassCard>
            </ScrollView>
        </GlassScreen>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
    headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 20 },
    formCard: { padding: 20 },
    label: { color: '#fff', marginTop: 15, marginBottom: 5, fontWeight: '600' },
    dropdown: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
    dropdownText: { color: '#fff', fontSize: 16 },
    dropdownArrow: { color: 'rgba(255,255,255,0.5)' },
    disabled: { opacity: 0.5 },
    input: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 10, color: '#fff', fontSize: 16 },
    button: { backgroundColor: '#8b5cf6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Quiz Styles
    quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    endButton: { padding: 10, backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 8 },
    endButtonText: { color: '#ef4444', fontWeight: 'bold' },
    progressText: { color: '#fff', fontSize: 16 },
    questionCard: { padding: 20 },
    questionText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, lineHeight: 26 },
    optionsContainer: { gap: 10 },
    optionButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    optionCorrect: { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981' },
    optionWrong: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' },
    optionBtnText: { color: '#fff', fontSize: 16 },
    feedbackContainer: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    feedbackTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    explanationText: { color: 'rgba(255,255,255,0.8)', lineHeight: 22, marginTop: 5 },
    nextButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1f2937', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
    modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalClose: { color: '#fff', fontSize: 20 },
    optionsList: { padding: 10 },
    optionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    optionText: { color: '#fff', fontSize: 16 },
});
