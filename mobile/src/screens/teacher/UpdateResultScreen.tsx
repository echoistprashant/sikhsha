import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, LineChart, User, Award, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];
const EXAM_TYPES = ['Unit Test', 'Mid-Term', 'Final Exam', 'Quiz', 'Practical'];
const MOCK_STUDENTS = [
    { id: '1', name: 'Rahul Kumar', class: 'Class 11' },
    { id: '2', name: 'Priya Sharma', class: 'Class 11' },
    { id: '3', name: 'Amit Singh', class: 'Class 11' },
    { id: '4', name: 'Sneha Patel', class: 'Class 12' },
    { id: '5', name: 'Vikram Reddy', class: 'Class 12' },
];

const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
        style={[chipStyles.chip, active && chipStyles.chipActive]}
        onPress={onPress}
    >
        {active && <Check size={12} color={DARK_BG} style={{ marginRight: 4 }} />}
        <Text style={[chipStyles.text, active && chipStyles.textActive]}>{label}</Text>
    </TouchableOpacity>
);
const chipStyles = StyleSheet.create({
    chip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    },
    chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
    text: { color: '#64748b', fontSize: 12, fontWeight: '500' },
    textActive: { color: DARK_BG, fontWeight: '700' },
});

const UpdateResultScreen: React.FC = () => {
    const navigation = useNavigation();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [subject, setSubject] = useState('');
    const [examType, setExamType] = useState('');
    const [examTitle, setExamTitle] = useState('');
    const [marksObtained, setMarksObtained] = useState('');
    const [totalMarks, setTotalMarks] = useState('');

    const percentage = marksObtained && totalMarks && !isNaN(+marksObtained) && !isNaN(+totalMarks) && +totalMarks > 0
        ? ((+marksObtained / +totalMarks) * 100).toFixed(1)
        : null;

    const gradeColor = percentage ? (+percentage >= 80 ? '#22c55e' : +percentage >= 60 ? '#f59e0b' : '#ef4444') : PRIMARY;

    const handleSubmit = async () => {
        if (!selectedStudent || !subject || !examType || !examTitle || !marksObtained || !totalMarks) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }
        const obtained = +marksObtained; const total = +totalMarks;
        if (isNaN(obtained) || isNaN(total) || obtained < 0 || total <= 0 || obtained > total) {
            Alert.alert('Invalid Marks', 'Please enter valid marks.');
            return;
        }
        setLoading(true);
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        Alert.alert('Success', `Result updated! Score: ${obtained}/${total} (${percentage}%)`, [
            { text: 'OK', onPress: () => { setSelectedStudent(''); setSubject(''); setExamType(''); setExamTitle(''); setMarksObtained(''); setTotalMarks(''); } },
        ]);
        setLoading(false);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={20} color="#f1f5f9" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Update Results</Text>
                    <Text style={styles.headerSub}>Enter exam scores for students</Text>
                </View>
                <LineChart size={20} color={PRIMARY} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Percentage Preview Card */}
                {percentage && (
                    <View style={[styles.previewCard, { borderColor: gradeColor + '50' }]}>
                        <Text style={styles.previewLabel}>SCORE PREVIEW</Text>
                        <Text style={[styles.previewValue, { color: gradeColor }]}>{percentage}%</Text>
                        <Text style={styles.previewSub}>{marksObtained} / {totalMarks} Marks</Text>
                    </View>
                )}

                {/* Students */}
                <Text style={styles.sectionLabel}>Select Student</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studentScroll}>
                    {MOCK_STUDENTS.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            style={[styles.studentCard, selectedStudent === s.id && styles.studentCardActive]}
                            onPress={() => setSelectedStudent(s.id)}
                        >
                            <View style={styles.studentAvatar}>
                                <User size={18} color={selectedStudent === s.id ? DARK_BG : PRIMARY} />
                            </View>
                            <Text style={[styles.studentName, selectedStudent === s.id && styles.studentNameActive]}>{s.name}</Text>
                            <Text style={styles.studentClass}>{s.class}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Subject */}
                <Text style={styles.sectionLabel}>Subject</Text>
                <View style={styles.chipRow}>
                    {SUBJECTS.map(sub => <Chip key={sub} label={sub} active={subject === sub} onPress={() => setSubject(sub)} />)}
                </View>

                {/* Exam Type */}
                <Text style={styles.sectionLabel}>Exam Type</Text>
                <View style={styles.chipRow}>
                    {EXAM_TYPES.map(type => <Chip key={type} label={type} active={examType === type} onPress={() => setExamType(type)} />)}
                </View>

                {/* Exam Title */}
                <Text style={styles.sectionLabel}>Exam Title</Text>
                <View style={styles.inputRow}>
                    <Award size={16} color="#64748b" />
                    <TextInput
                        style={styles.inputField}
                        placeholder="e.g., Chapter 5 Unit Test"
                        placeholderTextColor="#475569"
                        value={examTitle}
                        onChangeText={setExamTitle}
                    />
                </View>

                {/* Marks */}
                <View style={styles.marksRow}>
                    <View style={styles.marksField}>
                        <Text style={styles.sectionLabel}>Marks Obtained</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.inputField}
                                placeholder="85"
                                placeholderTextColor="#475569"
                                value={marksObtained}
                                onChangeText={setMarksObtained}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View style={styles.marksField}>
                        <Text style={styles.sectionLabel}>Total Marks</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.inputField}
                                placeholder="100"
                                placeholderTextColor="#475569"
                                value={totalMarks}
                                onChangeText={setTotalMarks}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[PRIMARY, '#0db8d9']} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        {loading ? <ActivityIndicator color={DARK_BG} /> : <Text style={styles.submitText}>Save Result</Text>}
                    </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: DARK_BG },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
    headerSub: { color: '#64748b', fontSize: 11 },
    scroll: { padding: 20, gap: 0 },
    previewCard: {
        backgroundColor: 'rgba(19,200,236,0.06)', borderWidth: 1,
        borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 24,
    },
    previewLabel: { color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
    previewValue: { fontSize: 52, fontWeight: '800', lineHeight: 62 },
    previewSub: { color: '#64748b', fontSize: 13, marginTop: 4 },
    sectionLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, marginTop: 20, textTransform: 'uppercase' },
    studentScroll: { gap: 12, paddingBottom: 4 },
    studentCard: {
        paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', gap: 6,
        borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD_BG, minWidth: 100,
    },
    studentCardActive: { borderColor: PRIMARY, backgroundColor: PRIMARY },
    studentAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(19,200,236,0.1)', alignItems: 'center', justifyContent: 'center',
    },
    studentName: { color: '#f1f5f9', fontWeight: '600', fontSize: 12, textAlign: 'center' },
    studentNameActive: { color: DARK_BG },
    studentClass: { color: '#64748b', fontSize: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
        borderRadius: 12, paddingHorizontal: 14, height: 48,
    },
    inputField: { flex: 1, color: '#f1f5f9', fontSize: 14 },
    marksRow: { flexDirection: 'row', gap: 14, marginTop: 0 },
    marksField: { flex: 1 },
    submitBtn: {
        marginTop: 28, borderRadius: 14, overflow: 'hidden',
        shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
    },
    submitGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    submitText: { color: DARK_BG, fontSize: 16, fontWeight: '700' },
});

export default UpdateResultScreen;
