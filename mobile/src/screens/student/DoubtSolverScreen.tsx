import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassView } from '../../components/GlassView';
import { submitTextDoubt } from '../../api/studentApi';
import { useAuth } from '../../context/AuthContext';

export const DoubtSolverScreen = () => {
    const navigation = useNavigation();
    const { token } = useAuth();
    const [subject, setSubject] = useState('');
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [solution, setSolution] = useState<any>(null);

    const handleSolve = async () => {
        if (!subject || !question) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const result = await submitTextDoubt(token!, {
                subject,
                question,
            });
            setSolution(result);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to solve doubt');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerTitle}>Doubt Solver</Text>
            <Text style={styles.headerSubtitle}>Get instant help with your studies</Text>

            <GlassView style={styles.formCard}>
                <Text style={styles.label}>Subject *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Mathematics"
                    placeholderTextColor="#999"
                    value={subject}
                    onChangeText={setSubject}
                />

                <Text style={styles.label}>Your Question *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Type your question here..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    value={question}
                    onChangeText={setQuestion}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSolve}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Solve Doubt</Text>
                    )}
                </TouchableOpacity>
            </GlassView>

            {solution && (
                <GlassView style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Explanation</Text>
                    <Text style={styles.bodyText}>{solution.solution || solution.answer}</Text>

                    {solution.related_concepts && (
                        <>
                            <Text style={styles.sectionTitle}>Related Concepts</Text>
                            <View style={styles.tagsContainer}>
                                {solution.related_concepts.map((concept: string, index: number) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{concept}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </GlassView>
            )}
        </ScrollView>
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
        color: '#333',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    formCard: {
        padding: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#d97706',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#d97706',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultCard: {
        padding: 20,
        marginTop: 10,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    bodyText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    tagText: {
        fontSize: 12,
        color: '#555',
    },
});
