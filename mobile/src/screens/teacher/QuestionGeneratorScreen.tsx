import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
    Linking,
} from 'react-native';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import * as curriculumApi from '../../api/curriculumApi';
import { request } from '../../api/httpClient';
import { logger } from '../../utils/logger';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { generatePDF, sharePDF } from '../../utils/pdfService';

type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-in-blank' | 'long-answer' | 'reasoning-based' | 'application-based' | 'analytical' | 'case-study' | 'problem-solving';
type GenerationMode = 'single' | 'mixed';

interface MixedQuestionType {
    type: QuestionType;
    count: number;
}

const questionTypeOptions: { value: QuestionType; label: string }[] = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'long-answer', label: 'Long Answer' },
    { value: 'fill-in-blank', label: 'Fill in the Blank' },
    { value: 'reasoning-based', label: 'Reasoning Based' },
    { value: 'application-based', label: 'Application Based' },
    { value: 'analytical', label: 'Analytical' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'problem-solving', label: 'Problem Solving' },
];

export const QuestionGeneratorScreen = () => {
    const { token } = useAuth();

    // Curriculum selection state
    const [classes, setClasses] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<curriculumApi.CurriculumSubject[]>([]);
    const [topics, setTopics] = useState<string[]>([]);

    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');

    // Question generation state
    const [generationMode, setGenerationMode] = useState<GenerationMode>('single');
    const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
    const [questionCount, setQuestionCount] = useState('10');
    const [difficulty, setDifficulty] = useState<number>(3);

    // Mixed mode state
    const [mixedQuestionTypes, setMixedQuestionTypes] = useState<MixedQuestionType[]>([
        { type: 'multiple-choice', count: 5 }
    ]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [showTopicPicker, setShowTopicPicker] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [selectedTypeIndex, setSelectedTypeIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatedQuestions, setGeneratedQuestions] = useState<any[] | null>(null);

    // Load classes on mount
    useEffect(() => {
        loadClasses();
    }, []);

    // Load subjects when class changes
    useEffect(() => {
        if (selectedClass) {
            loadSubjects(selectedClass);
            setSelectedSubject('');
            setSelectedTopic('');
            setTopics([]);
        }
    }, [selectedClass]);

    // Load topics when subject changes
    useEffect(() => {
        if (selectedClass && selectedSubject) {
            loadTopics(selectedClass, selectedSubject);
            setSelectedTopic('');
        }
    }, [selectedSubject]);

    const loadClasses = async () => {
        if (!token) return;

        try {
            setLoadingClasses(true);
            const data = await curriculumApi.getClasses(token);
            setClasses(data);
        } catch (err: any) {
            logger.error('Failed to load classes', { error: err.message });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load classes',
            });
        } finally {
            setLoadingClasses(false);
        }
    };

    const loadSubjects = async (classLevel: string) => {
        if (!token) return;

        try {
            setLoadingSubjects(true);
            const data = await curriculumApi.getSubjects(token, classLevel);
            setSubjects(data);
        } catch (err: any) {
            logger.error('Failed to load subjects', { error: err.message });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load subjects',
            });
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadTopics = async (classLevel: string, subject: string) => {
        if (!token) return;

        try {
            setLoadingTopics(true);
            const data = await curriculumApi.getTopics(token, classLevel, subject);
            setTopics(data.topics);
        } catch (err: any) {
            logger.error('Failed to load topics', { error: err.message });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load topics',
            });
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleGeneratePDF = async () => {
        if (!generatedQuestions || generatedQuestions.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'No Questions',
                text2: 'Generate questions first to download PDF',
            });
            return;
        }

        setGeneratingPDF(true);
        try {
            const questionsHtml = generatedQuestions.map((q: any, index: number) => `
                <div class="question-item">
                    <div class="question-text">
                        <span class="q-num">${index + 1}.</span> ${q.question}
                    </div>
                    ${q.options ? `
                        <div class="options-grid">
                            ${q.options.map((opt: string, i: number) => `
                                <div class="option">
                                    <span class="opt-label">${String.fromCharCode(65 + i)}.</span> ${opt}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="space-for-answer"></div>'}
                </div>
            `).join('');

            const answersHtml = generatedQuestions.map((q: any, index: number) => `
                <div class="answer-item">
                    <span class="a-num">${index + 1}.</span> ${q.answer || 'Answer not provided'}
                </div>
            `).join('');

            const html = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
                        h1 { color: #3b82f6; margin: 0 0 10px 0; }
                        .meta { color: #666; font-size: 14px; }
                        .question-item { margin-bottom: 25px; page-break-inside: avoid; }
                        .question-text { font-size: 16px; font-weight: 500; margin-bottom: 10px; }
                        .q-num { color: #3b82f6; font-weight: bold; margin-right: 5px; }
                        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-left: 25px; }
                        .option { font-size: 14px; }
                        .opt-label { font-weight: bold; margin-right: 5px; }
                        .space-for-answer { height: 60px; border-bottom: 1px dashed #ccc; margin-top: 10px; width: 100%; }
                        .page-break { page-break-before: always; }
                        .answer-header { margin-top: 0; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; }
                        .answer-item { margin-bottom: 10px; font-size: 14px; }
                        .a-num { font-weight: bold; margin-right: 10px; color: #10b981; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${selectedSubject} Worksheet</h1>
                        <div class="meta">
                            Class: ${selectedClass} • Topic: ${selectedTopic || 'General'} • Date: ${new Date().toLocaleDateString()}
                        </div>
                    </div>

                    <div class="questions">
                        ${questionsHtml}
                    </div>

                    <div class="page-break"></div>

                    <h2 class="answer-header">Answer Key</h2>
                    <div class="answers">
                        ${answersHtml}
                    </div>
                </body>
                </html>
            `;

            const fileName = `${selectedSubject}_Questions_${Date.now()}`;
            const filePath = await generatePDF({ html, fileName });

            if (filePath) {
                await sharePDF(filePath, fileName);
            }

        } catch (err: any) {
            console.error('PDF Gen Error:', err);
            Toast.show({
                type: 'error',
                text1: 'PDF Failed',
                text2: 'Could not generate PDF',
            });
        } finally {
            setGeneratingPDF(false);
        }
    };

    const handleGenerateQuestions = async () => {
        if (!token || !selectedTopic) return;

        setLoading(true);
        setError(null);
        setGeneratedQuestions(null); // Clear previous questions

        try {
            const endpoint = generationMode === 'mixed' ? '/questions/generate-mixed' : '/questions/generate';

            // Map 1-5 difficulty to easy/medium/hard
            const difficultyMap: Record<number, string> = {
                1: 'easy', 2: 'easy',
                3: 'medium',
                4: 'hard', 5: 'hard'
            };

            const body: any = {
                difficulty: difficultyMap[difficulty] || 'medium',
                chapter: selectedTopic,
                classLevel: `class ${selectedClass}`,
                subject: selectedSubject,
            };

            if (generationMode === 'mixed') {
                body.questionTypes = mixedQuestionTypes.map(qt => ({
                    type: qt.type === 'fill-in-blank' ? 'fill-in-the-blank' : qt.type,
                    count: qt.count
                }));
            } else {
                body.type = questionType === 'fill-in-blank' ? 'fill-in-the-blank' : questionType;
                body.count = parseInt(questionCount);
            }

            const response = await request<any>(endpoint, {
                method: 'POST',
                token,
                body,
            });

            const totalGenerated = response.questions?.length || 0;
            setGeneratedQuestions(response.questions || []);

            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: `Generated ${totalGenerated} questions`,
                visibilityTime: 3000,
            });

            logger.info('Questions generated successfully', { count: totalGenerated, mode: generationMode });
        } catch (err: any) {
            setError(err.message || 'Failed to generate questions');
            Toast.show({
                type: 'error',
                text1: 'Generation Failed',
                text2: err.message,
                visibilityTime: 5000,
            });
        } finally {
            setLoading(false);
        }
    };



    const canGenerate = selectedClass && selectedSubject && selectedTopic &&
        (generationMode === 'single' ? questionCount : mixedQuestionTypes.length > 0);

    const addMixedQuestionType = () => {
        setMixedQuestionTypes([...mixedQuestionTypes, { type: 'multiple-choice', count: 5 }]);
    };

    const removeMixedQuestionType = (index: number) => {
        setMixedQuestionTypes(mixedQuestionTypes.filter((_, i) => i !== index));
    };

    const updateMixedQuestionType = (index: number, field: 'type' | 'count', value: any) => {
        const updated = [...mixedQuestionTypes];
        updated[index] = { ...updated[index], [field]: value };
        setMixedQuestionTypes(updated);
    };

    const openTypePicker = (index: number) => {
        setSelectedTypeIndex(index);
        setShowTypePicker(true);
    };

    const selectQuestionType = (type: QuestionType) => {
        if (selectedTypeIndex !== null) {
            updateMixedQuestionType(selectedTypeIndex, 'type', type);
        }
        setShowTypePicker(false);
        setSelectedTypeIndex(null);
    };

    const getTypeLabel = (type: QuestionType): string => {
        return questionTypeOptions.find(opt => opt.value === type)?.label || type;
    };

    return (
        <GlassScreen>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Generate Questions</Text>
                <Text style={styles.subtitle}>
                    Select curriculum to generate questions
                </Text>

                {/* Class Selection */}
                <GlassCard style={styles.card}>
                    <Text style={styles.sectionTitle}>1. Select Class</Text>
                    {loadingClasses ? (
                        <ActivityIndicator color="#3b82f6" />
                    ) : (
                        <View style={styles.chipRow}>
                            {classes.map(cls => (
                                <TouchableOpacity
                                    key={cls}
                                    style={[
                                        styles.chip,
                                        selectedClass === cls && styles.chipActive,
                                    ]}
                                    onPress={() => setSelectedClass(cls)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            selectedClass === cls && styles.chipTextActive,
                                        ]}>
                                        Class {cls}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </GlassCard>

                {/* Subject Selection */}
                {selectedClass && (
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>2. Select Subject</Text>
                        {loadingSubjects ? (
                            <ActivityIndicator color="#3b82f6" />
                        ) : (
                            <View style={styles.subjectGrid}>
                                {subjects.map(subject => (
                                    <TouchableOpacity
                                        key={subject.id}
                                        style={[
                                            styles.subjectCard,
                                            selectedSubject === subject.id && styles.subjectCardActive,
                                        ]}
                                        onPress={() => setSelectedSubject(subject.id)}>
                                        <Text
                                            style={[
                                                styles.subjectText,
                                                selectedSubject === subject.id && styles.subjectTextActive,
                                            ]}>
                                            {subject.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </GlassCard>
                )}

                {/* Topic Selection */}
                {selectedSubject && (
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>3. Select Topic</Text>
                        {loadingTopics ? (
                            <ActivityIndicator color="#3b82f6" />
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.topicSelector}
                                    onPress={() => setShowTopicPicker(true)}>
                                    <Text style={selectedTopic ? styles.topicSelected : styles.topicPlaceholder}>
                                        {selectedTopic || 'Choose a topic...'}
                                    </Text>
                                    <Text style={styles.dropdownArrow}>▼</Text>
                                </TouchableOpacity>

                                <Modal
                                    visible={showTopicPicker}
                                    transparent
                                    animationType="slide"
                                    onRequestClose={() => setShowTopicPicker(false)}>
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                            <View style={styles.modalHeader}>
                                                <Text style={styles.modalTitle}>Select Topic</Text>
                                                <TouchableOpacity onPress={() => setShowTopicPicker(false)}>
                                                    <Text style={styles.modalClose}>✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <ScrollView style={styles.topicList}>
                                                {topics.map((topic, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={styles.topicItem}
                                                        onPress={() => {
                                                            setSelectedTopic(topic);
                                                            setShowTopicPicker(false);
                                                        }}>
                                                        <Text style={styles.topicItemText}>{topic}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                </Modal>
                            </>
                        )}
                    </GlassCard>
                )}

                {/* Question Configuration */}
                {selectedTopic && (
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>4. Generation Mode</Text>

                        <View style={styles.modeSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.modeButton,
                                    generationMode === 'single' && styles.modeButtonActive,
                                ]}
                                onPress={() => setGenerationMode('single')}>
                                <Text style={[
                                    styles.modeButtonText,
                                    generationMode === 'single' && styles.modeButtonTextActive,
                                ]}>Single Type</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modeButton,
                                    generationMode === 'mixed' && styles.modeButtonActive,
                                ]}
                                onPress={() => setGenerationMode('mixed')}>
                                <Text style={[
                                    styles.modeButtonText,
                                    generationMode === 'mixed' && styles.modeButtonTextActive,
                                ]}>Mixed Types ✨</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                )}

                {/* Single Mode Configuration */}
                {selectedTopic && generationMode === 'single' && (
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>5. Question Settings</Text>

                        <Text style={styles.label}>Question Type</Text>
                        <View style={styles.chipRow}>
                            <TouchableOpacity
                                style={[
                                    styles.typeChip,
                                    questionType === 'multiple-choice' && styles.typeChipActive,
                                ]}
                                onPress={() => setQuestionType('multiple-choice')}>
                                <Text style={styles.typeChipText}>MCQ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeChip,
                                    questionType === 'true-false' && styles.typeChipActive,
                                ]}
                                onPress={() => setQuestionType('true-false')}>
                                <Text style={styles.typeChipText}>True/False</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeChip,
                                    questionType === 'short-answer' && styles.typeChipActive,
                                ]}
                                onPress={() => setQuestionType('short-answer')}>
                                <Text style={styles.typeChipText}>Short Answer</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Number of Questions</Text>
                        <TextInput
                            style={styles.input}
                            value={questionCount}
                            onChangeText={setQuestionCount}
                            keyboardType="number-pad"
                            placeholder="10"
                            placeholderTextColor="rgba(148,163,184,0.5)"
                        />

                        <Text style={styles.label}>Difficulty (1-5)</Text>
                        <View style={styles.chipRow}>
                            {[1, 2, 3, 4, 5].map(level => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.difficultyChip,
                                        difficulty === level && styles.difficultyChipActive,
                                    ]}
                                    onPress={() => setDifficulty(level)}>
                                    <Text style={styles.difficultyText}>{level}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </GlassCard>
                )}

                {/* Mixed Mode Configuration */}
                {selectedTopic && generationMode === 'mixed' && (
                    <GlassCard style={styles.card}>
                        <View style={styles.mixedHeader}>
                            <Text style={styles.sectionTitle}>5. Question Types</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={addMixedQuestionType}>
                                <Text style={styles.addButtonText}>+ Add Type</Text>
                            </TouchableOpacity>
                        </View>

                        {mixedQuestionTypes.map((qt, index) => (
                            <View key={index} style={styles.mixedTypeRow}>
                                <View style={styles.mixedTypeSelector}>
                                    <TouchableOpacity
                                        style={styles.typeDropdown}
                                        onPress={() => openTypePicker(index)}>
                                        <Text style={styles.typeDropdownText}>
                                            {getTypeLabel(qt.type)}
                                        </Text>
                                        <Text style={styles.dropdownArrow}>▼</Text>
                                    </TouchableOpacity>
                                    <TextInput
                                        style={styles.countInput}
                                        value={String(qt.count)}
                                        onChangeText={(text) => updateMixedQuestionType(index, 'count', parseInt(text) || 0)}
                                        keyboardType="number-pad"
                                        placeholder="0"
                                        placeholderTextColor="rgba(148,163,184,0.5)"
                                    />
                                    {mixedQuestionTypes.length > 1 && (
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => removeMixedQuestionType(index)}>
                                            <Text style={styles.removeButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}

                        <Text style={styles.label}>Difficulty (1-5)</Text>
                        <View style={styles.chipRow}>
                            {[1, 2, 3, 4, 5].map(level => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.difficultyChip,
                                        difficulty === level && styles.difficultyChipActive,
                                    ]}
                                    onPress={() => setDifficulty(level)}>
                                    <Text style={styles.difficultyText}>{level}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </GlassCard>
                )}

                {/* Generate Buttons */}
                {canGenerate && (
                    <GlassCard style={styles.card}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonPrimary]}
                            onPress={handleGenerateQuestions}
                            disabled={loading || generatingPDF}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Generate Questions 📝</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={handleGeneratePDF}
                            disabled={loading || generatingPDF}>
                            {generatingPDF ? (
                                <ActivityIndicator color="#3b82f6" />
                            ) : (
                                <Text style={styles.buttonTextSecondary}>Download as PDF 📄</Text>
                            )}
                        </TouchableOpacity>
                    </GlassCard>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Results Display */}
            {generatedQuestions && generatedQuestions.length > 0 && (
                <GlassCard style={styles.card}>
                    <Text style={styles.sectionTitle}>Generated Questions ({generatedQuestions.length})</Text>
                    <ScrollView style={styles.questionsContainer}>
                        {generatedQuestions.map((q: any, index: number) => (
                            <View key={index} style={styles.questionCard}>
                                <Text style={styles.questionNumber}>Q{index + 1}.</Text>
                                <Text style={styles.questionText}>{q.question}</Text>
                                {q.options && (
                                    <View style={styles.optionsContainer}>
                                        {q.options.map((opt: string, i: number) => (
                                            <Text key={i} style={styles.optionText}>
                                                {String.fromCharCode(65 + i)}. {opt}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </GlassCard>
            )}

            {/* Question Type Picker Modal */}
            <Modal
                visible={showTypePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTypePicker(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Question Type</Text>
                            <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.topicList}>
                            {questionTypeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={styles.topicItem}
                                    onPress={() => selectQuestionType(option.value)}>
                                    <Text style={styles.topicItemText}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </GlassScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 24,
    },
    card: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    chipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    chipText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '500',
    },
    chipTextActive: {
        color: '#fff',
    },
    subjectGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    subjectCard: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    subjectCardActive: {
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: '#3b82f6',
    },
    subjectText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '500',
    },
    subjectTextActive: {
        color: '#3b82f6',
    },
    topicSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    topicPlaceholder: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
    },
    topicSelected: {
        color: '#fff',
        fontSize: 16,
        flex: 1,
    },
    dropdownArrow: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    modalClose: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 24,
        fontWeight: 'bold',
    },
    topicList: {
        padding: 8,
    },
    topicItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    topicItemText: {
        color: '#fff',
        fontSize: 16,
    },
    label: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 16,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    typeChipActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    typeChipText: {
        color: '#fff',
        fontSize: 14,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    difficultyChip: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    difficultyChipActive: {
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
    },
    difficultyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonPrimary: {
        backgroundColor: '#3b82f6',
    },
    buttonSecondary: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
    },
    // Mode selector styles
    modeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    modeButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: '#3b82f6',
    },
    modeButtonText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '600',
    },
    modeButtonTextActive: {
        color: '#3b82f6',
    },
    // Mixed mode styles
    mixedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#10b981',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    mixedTypeRow: {
        marginBottom: 12,
    },
    mixedTypeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    typeDropdown: {
        flex: 2,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    typeDropdownText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    countInput: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    removeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderWidth: 1,
        borderColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        color: '#ef4444',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Questions display styles
    questionsContainer: {
        maxHeight: 400,
    },
    questionCard: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#3b82f6',
    },
    questionNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: 8,
    },
    questionText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 12,
        lineHeight: 24,
    },
    optionsContainer: {
        marginTop: 8,
    },
    optionText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 6,
        paddingLeft: 12,
    },
});
