import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, CheckCircle2, XCircle, Users, Calendar, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import {
    getMyStudents, markAttendance, getClassAttendance,
    type Student, type AttendanceRecord,
} from '../../api/attendanceApi';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.06)';

const AttendanceScreen: React.FC = () => {
    const navigation = useNavigation();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [classInfo, setClassInfo] = useState<{ class: string; section: string }>({ class: '', section: '' });
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
    const [error, setError] = useState<string | null>(null);
    const [notClassTeacher, setNotClassTeacher] = useState(false);
    const [attendanceMarked, setAttendanceMarked] = useState(false);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const loadStudents = async () => {
        if (!token) { return; }
        setLoading(true); setError(null); setNotClassTeacher(false); setAttendanceMarked(false);
        try {
            const data = await getMyStudents(token);
            setStudents(data.students); setClassInfo({ class: data.class, section: data.section });
            const todayDate = new Date().toISOString().split('T')[0];
            try {
                const att = await getClassAttendance(token, { date: todayDate, class: data.class, section: data.section });
                if (att.records?.length > 0) { setAttendanceMarked(true); return; }
            } catch { /* not yet marked */ }
            const defaultAtt: Record<string, 'present' | 'absent'> = {};
            data.students.forEach((s: Student) => { defaultAtt[s.id] = 'present'; });
            setAttendance(defaultAtt);
        } catch (err: any) {
            if (err.message?.includes('NOT_CLASS_TEACHER') || err.message?.includes('not assigned as a class teacher')) {
                setNotClassTeacher(true);
            } else { setError(err.message || 'Failed to load students'); }
        } finally { setLoading(false); }
    };

    useEffect(() => { loadStudents(); }, [token]);

    const toggleStatus = (id: string) => {
        setAttendance(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : 'present' }));
    };

    const handleSubmit = () => {
        Alert.alert('Submit Attendance', 'Submit attendance for today?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Submit', onPress: submitAttendance },
        ]);
    };

    const submitAttendance = async () => {
        setSubmitting(true); setError(null);
        try {
            const records: AttendanceRecord[] = students.map(s => ({ studentId: s.id, status: attendance[s.id] }));
            const date = new Date().toISOString().split('T')[0];
            await markAttendance(token!, { date, attendance: records });
            Alert.alert('Success', 'Attendance submitted!', [{ text: 'OK', onPress: loadStudents }]);
        } catch (err: any) {
            const msg = err.message || 'Failed to submit';
            if (msg.includes('future date')) { Alert.alert('Invalid Date', 'Cannot mark future date attendance.'); }
            else { setError(msg); Alert.alert('Error', msg); }
        } finally { setSubmitting(false); }
    };

    const presentCount = Object.values(attendance).filter(s => s === 'present').length;
    const absentCount = students.length - presentCount;

    if (notClassTeacher) {
        return (
            <View style={[styles.root, styles.center]}>
                <Users size={48} color={PRIMARY} />
                <Text style={styles.cTitle}>Not Assigned as Class Teacher</Text>
                <Text style={styles.cSub}>Please contact your administrator to get assigned to a class.</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadStudents}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
            </View>
        );
    }

    if (attendanceMarked) {
        return (
            <View style={[styles.root, styles.center]}>
                <CheckCircle2 size={56} color="#22c55e" />
                <Text style={styles.cTitle}>Attendance Already Marked</Text>
                <Text style={styles.cSub}>Class: {classInfo.class} - Section {classInfo.section}</Text>
                <Text style={styles.cSub}>{new Date().toLocaleDateString()}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadStudents}><Text style={styles.retryText}>Refresh</Text></TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={20} color="#f1f5f9" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Mark Attendance</Text>
                    <Text style={styles.headerSub}>{classInfo.class && `${classInfo.class} - Sec ${classInfo.section}`}</Text>
                </View>
                <Calendar size={20} color={PRIMARY} />
            </View>

            {/* Date bar */}
            <View style={styles.dateBanner}>
                <Text style={styles.dateText}>{today}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statVal}>{students.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statCard, styles.presentStat]}>
                    <Text style={[styles.statVal, { color: '#22c55e' }]}>{presentCount}</Text>
                    <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={[styles.statCard, styles.absentStat]}>
                    <Text style={[styles.statVal, { color: '#ef4444' }]}>{absentCount}</Text>
                    <Text style={styles.statLabel}>Absent</Text>
                </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {loading ? (
                <ActivityIndicator color={PRIMARY} style={{ marginTop: 40 }} />
            ) : (
                <>
                    <ScrollView style={styles.list} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
                        <Text style={styles.instruction}>Tap a name to toggle present/absent</Text>
                        {students.map((student, idx) => {
                            const isPresent = attendance[student.id] === 'present';
                            return (
                                <TouchableOpacity
                                    key={student.id}
                                    style={[styles.studentRow, idx === 0 && { borderTopWidth: 0 }]}
                                    onPress={() => toggleStatus(student.id)}
                                >
                                    {/* Avatar */}
                                    <View style={[styles.studentAvatar, isPresent ? styles.avatarPresent : styles.avatarAbsent]}>
                                        <Text style={[styles.studentAvatarText, !isPresent && styles.avatarTextAbsent]}>
                                            {student.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentSection}>Section {student.section}</Text>
                                    </View>
                                    {isPresent
                                        ? <CheckCircle2 size={24} color="#22c55e" />
                                        : <XCircle size={24} color="#ef4444" />
                                    }
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Submit Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSubmit}
                            disabled={submitting || students.length === 0}
                            activeOpacity={0.85}
                        >
                            <LinearGradient colors={[PRIMARY, '#0db8d9']} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                {submitting
                                    ? <ActivityIndicator color={DARK_BG} />
                                    : (
                                        <View style={styles.submitInner}>
                                            <Text style={styles.submitText}>Submit Attendance</Text>
                                            <Send size={16} color={DARK_BG} />
                                        </View>
                                    )
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: DARK_BG },
    center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    cTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 8, textAlign: 'center' },
    cSub: { color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 4 },
    retryBtn: {
        marginTop: 20, backgroundColor: 'rgba(19,200,236,0.15)', borderRadius: 10,
        paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: PRIMARY,
    },
    retryText: { color: PRIMARY, fontWeight: '700', fontSize: 14 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    backBtn: { width: 38, alignItems: 'flex-start' },
    headerCenter: { alignItems: 'center' },
    headerTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
    headerSub: { color: '#64748b', fontSize: 11 },
    dateBanner: { backgroundColor: CARD_BG, paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
    dateText: { color: '#94a3b8', fontSize: 12 },
    statsRow: {
        flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    },
    statCard: {
        flex: 1, alignItems: 'center', paddingVertical: 12,
        backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    },
    presentStat: { borderColor: 'rgba(34,197,94,0.2)' },
    absentStat: { borderColor: 'rgba(239,68,68,0.2)' },
    statVal: { color: '#f1f5f9', fontSize: 24, fontWeight: '700' },
    statLabel: { color: '#64748b', fontSize: 10, marginTop: 4 },
    errorText: { color: '#f87171', marginHorizontal: 16, marginBottom: 8, fontSize: 13 },
    list: { flex: 1 },
    instruction: { color: '#475569', fontSize: 11, marginBottom: 10, textAlign: 'center' },
    studentRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 12, borderTopWidth: 1, borderTopColor: BORDER,
    },
    studentAvatar: {
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: 'rgba(19,200,236,0.15)', alignItems: 'center', justifyContent: 'center',
    },
    avatarPresent: { backgroundColor: 'rgba(34,197,94,0.15)' },
    avatarAbsent: { backgroundColor: 'rgba(239,68,68,0.12)' },
    studentAvatarText: { color: '#22c55e', fontWeight: '700', fontSize: 16 },
    avatarTextAbsent: { color: '#ef4444' },
    studentInfo: { flex: 1 },
    studentName: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
    studentSection: { color: '#64748b', fontSize: 11, marginTop: 2 },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: 'rgba(16,31,34,0.95)', borderTopWidth: 1, borderTopColor: BORDER,
    },
    submitBtn: { borderRadius: 14, overflow: 'hidden' },
    submitGrad: { paddingVertical: 15 },
    submitInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    submitText: { color: DARK_BG, fontSize: 16, fontWeight: '700' },
});

export default AttendanceScreen;
