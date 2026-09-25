import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { getStudentResults, type Result } from '../../api/resultsApi';

const ResultsScreen: React.FC = () => {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<Result[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!token) return;
            setLoading(true);
            setError(null);
            try {
                const response = await getStudentResults(token);
                setResults(response.results);
            } catch (err: any) {
                setError(err.message || 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [token]);

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return '#34d399';
        if (percentage >= 75) return '#38bdf8';
        if (percentage >= 60) return '#fbbf24';
        return '#f87171';
    };

    const getGrade = (percentage: number) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (!token || user?.role !== 'student') {
        return (
            <GlassScreen>
                <View style={styles.centerMessage}>
                    <Text style={styles.title}>Student access required</Text>
                    <Text style={styles.subtitle}>
                        Please log in with a student account to view results.
                    </Text>
                </View>
            </GlassScreen>
        );
    }

    if (loading) {
        return (
            <GlassScreen>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#e5e7eb" />
                    <Text style={styles.loadingText}>Loading results...</Text>
                </View>
            </GlassScreen>
        );
    }

    const averagePercentage = results.length > 0
        ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
        : 0;

    return (
        <GlassScreen>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.heading}>📊 Exam Results</Text>
                <Text style={styles.subtitle}>
                    View your exam scores and grades.
                </Text>

                {/* Overall Stats */}
                <View style={styles.statsRow}>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statValue}>{results.length}</Text>
                        <Text style={styles.statLabel}>Exams Taken</Text>
                    </GlassCard>
                    <GlassCard style={[styles.statCard, styles.highlightCard]}>
                        <Text style={[styles.statValue, { color: getGradeColor(averagePercentage) }]}>
                            {averagePercentage.toFixed(1)}%
                        </Text>
                        <Text style={styles.statLabel}>Average</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={[styles.statValue, { color: getGradeColor(averagePercentage) }]}>
                            {getGrade(averagePercentage)}
                        </Text>
                        <Text style={styles.statLabel}>Overall Grade</Text>
                    </GlassCard>
                </View>

                {/* Results List */}
                {results.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No exam results available yet.</Text>
                    </GlassCard>
                ) : (
                    results.map(result => (
                        <GlassCard key={result.id} style={styles.resultCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.headerLeft}>
                                    <Text style={styles.subjectBadge}>{result.subject}</Text>
                                    <Text style={styles.examDate}>{result.exam_date ? formatDate(result.exam_date) : 'N/A'}</Text>
                                </View>
                                <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(result.percentage) + '20' }]}>
                                    <Text style={[styles.gradeText, { color: getGradeColor(result.percentage) }]}>
                                        {getGrade(result.percentage)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.examTitle}>{result.exam_title}</Text>
                            <View style={styles.scoresRow}>
                                <View style={styles.scoreItem}>
                                    <Text style={styles.scoreValue}>{result.marks_obtained}</Text>
                                    <Text style={styles.scoreLabel}>Marks</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.scoreItem}>
                                    <Text style={styles.scoreValue}>{result.total_marks}</Text>
                                    <Text style={styles.scoreLabel}>Total</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.scoreItem}>
                                    <Text style={[styles.scoreValue, { color: getGradeColor(result.percentage) }]}>
                                        {result.percentage}%
                                    </Text>
                                    <Text style={styles.scoreLabel}>Percentage</Text>
                                </View>
                            </View>
                        </GlassCard>
                    ))
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
    heading: {
        fontSize: 22,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    highlightCard: {
        borderColor: 'rgba(56, 189, 248, 0.6)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#e5e7eb',
    },
    statLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 2,
    },
    resultCard: {
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    headerLeft: {
        flex: 1,
    },
    subjectBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: '#38bdf8',
        marginBottom: 4,
    },
    examDate: {
        fontSize: 11,
        color: '#6b7280',
    },
    gradeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    gradeText: {
        fontSize: 16,
        fontWeight: '800',
    },
    examTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 12,
    },
    scoresRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 12,
        paddingVertical: 12,
    },
    scoreItem: {
        alignItems: 'center',
        flex: 1,
    },
    scoreValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#e5e7eb',
    },
    scoreLabel: {
        fontSize: 11,
        color: '#6b7280',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(75, 85, 99, 0.4)',
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
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
        marginBottom: 6,
    },
});

export default ResultsScreen;
