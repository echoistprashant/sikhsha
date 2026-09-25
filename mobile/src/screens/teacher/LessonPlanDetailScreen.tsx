import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TeacherStackParamList } from '../../navigation/TeacherNavigator';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { getLessonPlanById, deleteLessonPlan } from '../../api/teacherApi';
import type { LessonPlanDetail } from '../../api/teacherApi';
import { logger } from '../../utils/logger';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import { generatePDF, sharePDF } from '../../utils/pdfService';

type LessonPlanDetailRouteProp = RouteProp<TeacherStackParamList, 'LessonPlanDetail'>;

const LessonPlanDetailScreen: React.FC = () => {
    const route = useRoute<LessonPlanDetailRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
    const { token } = useAuth();
    const { planId } = route.params;

    const [plan, setPlan] = useState<LessonPlanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingPDF, setSavingPDF] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || !planId) {
            return;
        }

        let cancelled = false;

        const fetchPlan = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getLessonPlanById(token, planId);
                if (!cancelled) {
                    setPlan(data);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || 'Failed to load lesson plan');
                    logger.error('Failed to fetch lesson plan', { planId, error: err.message });
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchPlan();

        return () => {
            cancelled = true;
        };
    }, [token, planId]);

    const handleSavePDF = async () => {
        if (!plan) return;

        setSavingPDF(true);
        try {
            // Helper to generate chapters HTML
            const chaptersHtml = plan.chapters?.map((chapter, idx) => `
                <div class="chapter">
                    <h2 class="chapter-title">Chapter ${idx + 1}: ${chapter.name}</h2>
                    <p class="chapter-meta">⏱️ ${chapter.totalMinutes} mins • ${chapter.totalPeriods} periods</p>
                    
                    ${chapter.topics.map((topic) => `
                        <div class="topic">
                            <h3 class="topic-title">${topic.name}</h3>
                            <p class="topic-meta">Duration: ${topic.teachingMinutes} mins • Periods: ${topic.periods}</p>
                            
                            <div class="section">
                                <h4>Learning Objectives</h4>
                                <ul>${topic.objectives.map(obj => `<li>${obj}</li>`).join('')}</ul>
                            </div>
                            
                            <div class="section">
                                <h4>Key Points</h4>
                                <ul>${topic.keyPoints.map(kp => `<li>${kp}</li>`).join('')}</ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('') || '<p>No chapters available</p>';

            const html = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                        h1 { color: #5B21B6; border-bottom: 2px solid #5B21B6; padding-bottom: 10px; margin-bottom: 5px; }
                        .header-meta { margin-bottom: 30px; color: #666; font-size: 14px; }
                        .chapter { margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; border-radius: 8px; page-break-inside: avoid; }
                        .chapter-title { color: #5B21B6; margin-top: 0; }
                        .chapter-meta { font-style: italic; color: #666; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                        .topic { margin-top: 20px; padding-left: 15px; border-left: 3px solid #ddd; }
                        .topic-title { color: #444; margin-bottom: 5px; }
                        .topic-meta { font-size: 12px; color: #888; margin-bottom: 10px; }
                        .section h4 { margin-bottom: 5px; color: #555; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
                        ul { margin-top: 0; padding-left: 20px; }
                        li { margin-bottom: 4px; font-size: 14px; }
                        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${plan.title}</h1>
                    <div class="header-meta">
                        <strong>Subject:</strong> ${plan.subject} &nbsp;|&nbsp; 
                        <strong>Grade:</strong> ${plan.grade_level} &nbsp;|&nbsp; 
                        <strong>Total Duration:</strong> ${plan.totalHours} hours
                    </div>

                    ${chaptersHtml}

                    <div class="footer">
                        Generated by Sikhsha AI Teacher Assistant • ${new Date().toLocaleDateString()}
                    </div>
                </body>
                </html>
            `;

            const fileName = `LessonPlan_${plan.title.replace(/[^a-z0-9]/gi, '_')}`;
            const filePath = await generatePDF({ html, fileName });

            if (filePath) {
                await sharePDF(filePath, fileName);
                Toast.show({
                    type: 'success',
                    text1: 'PDF Ready',
                    text2: 'Sharing Lesson Plan PDF...',
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

    const handleDelete = async () => {
        if (!token || !plan) return;

        Alert.alert(
            'Delete Lesson Plan',
            `Are you sure you want to delete "${plan.title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLessonPlan(token, planId);

                            Toast.show({
                                type: 'success',
                                text1: 'Deleted',
                                text2: 'Lesson plan deleted successfully',
                            });
                            navigation.goBack();
                        } catch (err: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Delete Failed',
                                text2: err.message || 'Could not delete lesson plan',
                            });
                        }
                    },
                },
            ]
        );
    };

    if (!token) {
        return (
            <GlassScreen>
                <View style={styles.centerMessage}>
                    <Text style={styles.title}>Sign in required</Text>
                    <Text style={styles.metaText}>
                        Please log in to view lesson plan details.
                    </Text>
                </View>
            </GlassScreen>
        );
    }

    if (loading) {
        return (
            <GlassScreen>
                <View style={styles.centerMessage}>
                    <ActivityIndicator size="large" color="#818cf8" />
                    <Text style={styles.metaText}>Loading lesson plan...</Text>
                </View>
            </GlassScreen>
        );
    }

    if (error || !plan) {
        return (
            <GlassScreen>
                <View style={styles.centerMessage}>
                    <Text style={styles.title}>Error</Text>
                    <Text style={styles.metaText}>{error || 'Lesson plan not found'}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </GlassScreen>
        );
    }

    return (
        <GlassScreen>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header Card */}
                <GlassCard style={styles.headerCard}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.metaText}>
                        {plan.subject} • Grade {plan.grade_level}
                    </Text>
                    <Text style={styles.duration}>
                        ⏱️ {plan.totalHours}h • {plan.totalPeriods} periods
                    </Text>
                </GlassCard>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSavePDF}
                        disabled={savingPDF}>
                        {savingPDF ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.actionButtonText}>📄 Save PDF</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDelete}>
                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                </View>

                {/* Chapters */}
                {plan.chapters && plan.chapters.length > 0 ? (
                    plan.chapters.map((chapter, chIdx) => (
                        <GlassCard key={chIdx} style={styles.chapterCard}>
                            <Text style={styles.chapterTitle}>
                                Chapter {chIdx + 1}: {chapter.name}
                            </Text>
                            <Text style={styles.chapterMeta}>
                                ⏱️ {chapter.totalMinutes} min • {chapter.totalPeriods} periods
                            </Text>

                            {/* Topics */}
                            {chapter.topics && chapter.topics.length > 0 && (
                                <View style={styles.topicsContainer}>
                                    {chapter.topics.map((topic, tIdx) => (
                                        <View key={tIdx} style={styles.topicCard}>
                                            <Text style={styles.topicTitle}>
                                                {tIdx + 1}. {topic.name}
                                            </Text>
                                            <Text style={styles.topicDuration}>
                                                ⏱️ {topic.teachingMinutes} min ({topic.periods} periods)
                                            </Text>

                                            {topic.objectives && topic.objectives.length > 0 && (
                                                <View style={styles.subsection}>
                                                    <Text style={styles.subsectionTitle}>Objectives:</Text>
                                                    {topic.objectives.map((obj, i) => (
                                                        <Text key={i} style={styles.listItem}>
                                                            • {obj}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}

                                            {topic.keyPoints && topic.keyPoints.length > 0 && (
                                                <View style={styles.subsection}>
                                                    <Text style={styles.subsectionTitle}>Key Points:</Text>
                                                    {topic.keyPoints.map((point, i) => (
                                                        <Text key={i} style={styles.listItem}>
                                                            • {point}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </GlassCard>
                    ))
                ) : (
                    <GlassCard>
                        <Text style={styles.emptyText}>No chapters available</Text>
                    </GlassCard>
                )}
            </ScrollView>
        </GlassScreen>
    );
};

const styles = StyleSheet.create({
    scroll: {
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    centerMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
    },
    headerCard: {
        marginBottom: 12,
    },
    planTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#f9fafb',
        marginBottom: 8,
    },
    duration: {
        fontSize: 14,
        color: '#818cf8',
        marginTop: 4,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: 'rgba(129,140,248,0.9)',
    },
    deleteButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.6)',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fca5a5',
    },
    chapterCard: {
        marginBottom: 12,
    },
    chapterTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 4,
    },
    chapterMeta: {
        fontSize: 13,
        color: '#818cf8',
        marginBottom: 12,
    },
    topicsContainer: {
        marginTop: 8,
    },
    topicCard: {
        paddingLeft: 12,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: 'rgba(129,140,248,0.4)',
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f9fafb',
        marginBottom: 4,
    },
    topicDuration: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 8,
    },
    subsection: {
        marginTop: 8,
    },
    subsectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#d1d5db',
        marginBottom: 4,
    },
    listItem: {
        fontSize: 13,
        color: '#e5e7eb',
        lineHeight: 20,
        marginBottom: 2,
    },
    emptyText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(129,140,248,0.9)',
        borderRadius: 999,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
});

export default LessonPlanDetailScreen;
