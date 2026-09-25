import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, ClipboardList, Calendar, BookOpen, Users, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
const CLASSES = ['Class 9-A', 'Class 9-B', 'Class 10-A', 'Class 10-B', 'Class 11', 'Class 12'];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={fieldStyles.container}>
        <Text style={fieldStyles.label}>{label}</Text>
        {children}
    </View>
);
const fieldStyles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
});

const AssignHomeworkScreen: React.FC = () => {
    const navigation = useNavigation();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = async () => {
        if (!title.trim() || !subject || !description.trim() || !selectedClass || !dueDate.trim()) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }
        setLoading(true);
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        Alert.alert('Success', 'Homework assigned successfully!', [
            { text: 'OK', onPress: () => { setTitle(''); setSubject(''); setDescription(''); setSelectedClass(''); setDueDate(''); } },
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
                    <Text style={styles.headerTitle}>Assign Homework</Text>
                    <Text style={styles.headerSub}>Create new assignment</Text>
                </View>
                <ClipboardList size={20} color={PRIMARY} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Title */}
                <Field label="Assignment Title">
                    <View style={styles.inputRow}>
                        <BookOpen size={16} color="#64748b" />
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g., Chapter 5 Exercises"
                            placeholderTextColor="#475569"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                </Field>

                {/* Subject */}
                <Field label="Subject">
                    <View style={styles.chipGrid}>
                        {SUBJECTS.map(sub => (
                            <TouchableOpacity
                                key={sub}
                                style={[styles.chip, subject === sub && styles.chipActive]}
                                onPress={() => setSubject(sub)}
                            >
                                <Text style={[styles.chipText, subject === sub && styles.chipTextActive]}>{sub}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Field>

                {/* Class */}
                <Field label="Target Class">
                    <View style={styles.chipGrid}>
                        {CLASSES.map(cls => (
                            <TouchableOpacity
                                key={cls}
                                style={[styles.chip, selectedClass === cls && styles.chipActive]}
                                onPress={() => setSelectedClass(cls)}
                            >
                                <Text style={[styles.chipText, selectedClass === cls && styles.chipTextActive]}>{cls}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Field>

                {/* Description */}
                <Field label="Description">
                    <TextInput
                        style={[styles.inputRow, styles.textArea]}
                        placeholder="Describe the homework assignment in detail..."
                        placeholderTextColor="#475569"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </Field>

                {/* Due Date */}
                <Field label="Due Date">
                    <View style={styles.inputRow}>
                        <Calendar size={16} color="#64748b" />
                        <TextInput
                            style={styles.textInput}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#475569"
                            value={dueDate}
                            onChangeText={setDueDate}
                        />
                    </View>
                </Field>

                {/* Submit */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[PRIMARY, '#0db8d9']} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        {loading
                            ? <ActivityIndicator color={DARK_BG} />
                            : (
                                <View style={styles.submitInner}>
                                    <Text style={styles.submitText}>Assign Homework</Text>
                                    <Send size={16} color={DARK_BG} />
                                </View>
                            )
                        }
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
        flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
    headerSub: { color: '#64748b', fontSize: 11 },
    scroll: { padding: 20 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
        borderRadius: 12, paddingHorizontal: 14, minHeight: 48,
    },
    textInput: { flex: 1, color: '#f1f5f9', fontSize: 14 },
    textArea: { flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 12, height: 100 },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    },
    chipActive: { backgroundColor: 'rgba(19,200,236,0.15)', borderColor: PRIMARY },
    chipText: { color: '#64748b', fontSize: 12, fontWeight: '500' },
    chipTextActive: { color: PRIMARY, fontWeight: '700' },
    submitBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
    submitGrad: { paddingVertical: 16 },
    submitInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    submitText: { color: DARK_BG, fontSize: 16, fontWeight: '700' },
});

export default AssignHomeworkScreen;
