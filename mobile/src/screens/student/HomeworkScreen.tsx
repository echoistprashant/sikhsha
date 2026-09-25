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
import { getStudentHomework, type Homework } from '../../api/homeworkApi';

const HomeworkScreen: React.FC = () => {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [homework, setHomework] = useState<Homework[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!token) return;
            setLoading(true);
            setError(null);
            try {
                const data = await getStudentHomework(token);
                setHomework(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load homework');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [token]);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'submitted':
            case 'completed':
                return '#34d399';
            case 'overdue':
            case 'late':
                return '#f87171';
            default:
                return '#fbbf24';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'submitted':
            case 'completed':
                return '✓ Completed';
            case 'overdue':
            case 'late':
                return '⚠ Overdue';
            default:
                return '⏳ Pending';
        }
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
                        Please log in with a student account to view homework.
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
                    <Text style={styles.loadingText}>Loading homework...</Text>
                </View>
            </GlassScreen>
        );
    }

    const pendingCount = homework.filter(h => h.student_status === 'pending' || !h.student_status).length;
    const overdueCount = homework.filter(h => h.student_status === 'overdue' || h.student_status === 'late').length;

    return (
        <GlassScreen>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.heading}>📚 Homework</Text>
                <Text style={styles.subtitle}>
                    View your assignments and their due dates.
                </Text>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statValue}>{pendingCount}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </GlassCard>
                    <GlassCard style={[styles.statCard, overdueCount > 0 && styles.alertCard]}>
                        <Text style={[styles.statValue, overdueCount > 0 && styles.alertValue]}>{overdueCount}</Text>
                        <Text style={styles.statLabel}>Overdue</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statValue}>{homework.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </GlassCard>
                </View>

                {/* Homework List */}
                {homework.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No homework assigned yet! 🎉</Text>
                    </GlassCard>
                ) : (
                    homework.map(item => (
                        <GlassCard key={item.id} style={styles.homeworkCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.subjectBadge}>{item.subject}</Text>
                                <Text style={[styles.statusBadge, { color: getStatusColor(item.student_status) }]}>
                                    {getStatusLabel(item.student_status)}
                                </Text>
                            </View>
                            <Text style={styles.homeworkTitle}>{item.title}</Text>
                            <Text style={styles.homeworkDesc}>{item.description}</Text>
                            <View style={styles.cardFooter}>
                                <Text style={styles.dueDate}>Due: {formatDate(item.due_date)}</Text>
                                <Text style={styles.assignedBy}>By: {item.assigned_by_name || 'Teacher'}</Text>
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
    alertCard: {
        borderColor: 'rgba(248, 113, 113, 0.6)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#e5e7eb',
    },
    alertValue: {
        color: '#f87171',
    },
    statLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 2,
    },
    homeworkCard: {
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    subjectBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: '600',
    },
    homeworkTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 6,
    },
    homeworkDesc: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 12,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(75, 85, 99, 0.3)',
        paddingTop: 10,
    },
    dueDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    assignedBy: {
        fontSize: 12,
        color: '#9ca3af',
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

export default HomeworkScreen;
