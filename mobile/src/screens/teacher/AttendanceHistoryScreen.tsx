import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import {
    getAllClasses,
    getClassAttendance,
    type ClassInfo,
    type AttendanceHistoryRecord,
} from '../../api/attendanceApi';

const AttendanceHistoryScreen: React.FC = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0],
    );
    const [records, setRecords] = useState<AttendanceHistoryRecord[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        loadClasses();
    }, [token]);

    const loadClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllClasses(token!);
            setClasses(data.classes);
            if (data.classes.length > 0) {
                setSelectedClass(data.classes[0].class);
                setSelectedSection(data.classes[0].section);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const loadAttendance = async () => {
        if (!selectedClass || !selectedSection) return;

        setLoadingAttendance(true);
        setError(null);
        try {
            const data = await getClassAttendance(token!, {
                date: selectedDate,
                class: selectedClass,
                section: selectedSection,
            });
            setRecords(data.records);
        } catch (err: any) {
            setError(err.message || 'Failed to load attendance');
            setRecords([]);
        } finally {
            setLoadingAttendance(false);
        }
    };

    useEffect(() => {
        if (selectedClass && selectedSection) {
            loadAttendance();
        }
    }, [selectedClass, selectedSection, selectedDate]);

    const changeDate = (days: number) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + days);
        setSelectedDate(current.toISOString().split('T')[0]);
    };

    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;

    if (!token) {
        return (
            <GlassScreen>
                <View style={styles.centerMessage}>
                    <Text style={styles.title}>Sign in required</Text>
                    <Text style={styles.subtitle}>
                        Please log in as a teacher to view attendance history.
                    </Text>
                </View>
            </GlassScreen>
        );
    }

    return (
        <GlassScreen>
            <View style={styles.header}>
                <Text style={styles.title}>Attendance History</Text>
                <Text style={styles.subtitle}>View past attendance records</Text>
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#e5e7eb" />
                </View>
            ) : (
                <>
                    {/* Class Selector */}
                    <GlassCard style={styles.selectorCard}>
                        <Text style={styles.sectionTitle}>Select Class</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {classes.map(c => (
                                <TouchableOpacity
                                    key={`${c.class}-${c.section}`}
                                    style={[
                                        styles.classChip,
                                        selectedClass === c.class &&
                                        selectedSection === c.section &&
                                        styles.classChipSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedClass(c.class);
                                        setSelectedSection(c.section);
                                    }}>
                                    <Text
                                        style={[
                                            styles.classChipText,
                                            selectedClass === c.class &&
                                            selectedSection === c.section &&
                                            styles.classChipTextSelected,
                                        ]}>
                                        {c.class} - {c.section}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </GlassCard>

                    {/* Date Selector */}
                    <GlassCard style={styles.dateCard}>
                        <View style={styles.dateRow}>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => changeDate(-1)}>
                                <Text style={styles.dateButtonText}>← Prev</Text>
                            </TouchableOpacity>
                            <View style={styles.dateCenter}>
                                <Text style={styles.dateText}>
                                    {new Date(selectedDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </Text>
                                {selectedDate === new Date().toISOString().split('T')[0] && (
                                    <Text style={styles.todayBadge}>Today</Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.dateButton,
                                    selectedDate === new Date().toISOString().split('T')[0] &&
                                    styles.dateButtonDisabled,
                                ]}
                                onPress={() => changeDate(1)}
                                disabled={
                                    selectedDate === new Date().toISOString().split('T')[0]
                                }>
                                <Text style={styles.dateButtonText}>Next →</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>

                    {/* Summary */}
                    <GlassCard style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total</Text>
                                <Text style={styles.summaryValue}>{records.length}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryLabel, styles.presentLabel]}>
                                    Present
                                </Text>
                                <Text style={[styles.summaryValue, styles.presentValue]}>
                                    {presentCount}
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryLabel, styles.absentLabel]}>
                                    Absent
                                </Text>
                                <Text style={[styles.summaryValue, styles.absentValue]}>
                                    {absentCount}
                                </Text>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Records List */}
                    {loadingAttendance ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color="#e5e7eb" />
                        </View>
                    ) : (
                        <ScrollView style={styles.scrollView}>
                            {records.length === 0 ? (
                                <GlassCard style={styles.emptyCard}>
                                    <Text style={styles.emptyText}>
                                        No attendance records found for this date.
                                    </Text>
                                </GlassCard>
                            ) : (
                                <GlassCard style={styles.listCard}>
                                    <Text style={styles.sectionTitle}>Students</Text>
                                    {records.map((record, index) => (
                                        <View
                                            key={record.id}
                                            style={[
                                                styles.recordItem,
                                                index === 0 && styles.firstItem,
                                            ]}>
                                            <View style={styles.recordInfo}>
                                                <Text style={styles.recordName}>
                                                    {record.student_name}
                                                </Text>
                                                <Text style={styles.recordMeta}>
                                                    {new Date(record.marked_at).toLocaleTimeString(
                                                        'en-US',
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        },
                                                    )}
                                                </Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    record.status === 'present'
                                                        ? styles.statusPresent
                                                        : styles.statusAbsent,
                                                ]}>
                                                <Text style={styles.statusText}>
                                                    {record.status === 'present' ? 'P' : 'A'}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </GlassCard>
                            )}
                        </ScrollView>
                    )}
                </>
            )}
        </GlassScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    errorContainer: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    errorText: {
        color: '#fca5a5',
        fontSize: 14,
    },
    loader: {
        marginTop: 32,
        alignItems: 'center',
    },
    selectorCard: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e5e7eb',
        marginBottom: 8,
    },
    classChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(30,64,175,0.3)',
        borderWidth: 1,
        borderColor: 'rgba(30,64,175,0.5)',
        marginRight: 8,
    },
    classChipSelected: {
        backgroundColor: 'rgba(56,189,248,0.3)',
        borderColor: '#38bdf8',
    },
    classChipText: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '500',
    },
    classChipTextSelected: {
        color: '#38bdf8',
    },
    dateCard: {
        marginBottom: 12,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dateButtonDisabled: {
        opacity: 0.3,
    },
    dateButtonText: {
        color: '#38bdf8',
        fontSize: 14,
        fontWeight: '600',
    },
    dateCenter: {
        alignItems: 'center',
    },
    dateText: {
        color: '#f9fafb',
        fontSize: 16,
        fontWeight: '600',
    },
    todayBadge: {
        fontSize: 11,
        color: '#86efac',
        marginTop: 2,
    },
    summaryCard: {
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#e5e7eb',
    },
    presentLabel: {
        color: '#86efac',
    },
    presentValue: {
        color: '#86efac',
    },
    absentLabel: {
        color: '#fca5a5',
    },
    absentValue: {
        color: '#fca5a5',
    },
    scrollView: {
        flex: 1,
    },
    emptyCard: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 14,
    },
    listCard: {
        marginBottom: 16,
    },
    recordItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(30,64,175,0.5)',
    },
    firstItem: {
        borderTopWidth: 0,
    },
    recordInfo: {
        flex: 1,
    },
    recordName: {
        fontSize: 16,
        color: '#f9fafb',
        fontWeight: '500',
    },
    recordMeta: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    statusBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusPresent: {
        backgroundColor: '#22c55e',
    },
    statusAbsent: {
        backgroundColor: '#ef4444',
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    centerMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
});

export default AttendanceHistoryScreen;
