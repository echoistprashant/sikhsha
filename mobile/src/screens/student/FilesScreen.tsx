import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/StudentNavigator';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { getStudentMaterials, type StudyMaterial } from '../../api/materialsApi';

const FilesScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<StudyMaterial[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!token) return;
            setLoading(true);
            setError(null);
            try {
                const data = await getStudentMaterials(token);
                setFiles(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load files');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [token]);

    const getFileIcon = (type: StudyMaterial['file_type']) => {
        switch (type) {
            case 'pdf':
                return '📄';
            case 'doc':
                return '📝';
            case 'image':
                return '🖼️';
            case 'video':
                return '🎬';
            default:
                return '📁';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const subjects = [...new Set(files.map(f => f.subject))];
    const filteredFiles = selectedSubject
        ? files.filter(f => f.subject === selectedSubject)
        : files;

    const handleFilePress = (file: StudyMaterial) => {
        if (file.file_type === 'pdf') {
            navigation.navigate('PDFViewer' as keyof StudentStackParamList, { url: file.file_url, title: file.name } as any);
        }
    };

    if (!token || user?.role !== 'student') {
        return (
            <GlassScreen>
                <View style={styles.centerMessage}>
                    <Text style={styles.title}>Student access required</Text>
                    <Text style={styles.subtitle}>
                        Please log in with a student account to view files.
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
                    <Text style={styles.loadingText}>Loading files...</Text>
                </View>
            </GlassScreen>
        );
    }

    return (
        <GlassScreen>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.heading}>📁 Study Materials</Text>
                <Text style={styles.subtitle}>
                    Access your study materials and PDFs.
                </Text>

                {/* Subject Filter */}
                <View style={styles.filterRow}>
                    <TouchableOpacity
                        style={[styles.filterChip, !selectedSubject && styles.filterChipActive]}
                        onPress={() => setSelectedSubject(null)}>
                        <Text style={[styles.filterChipText, !selectedSubject && styles.filterChipTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {subjects.map(subject => (
                        <TouchableOpacity
                            key={subject}
                            style={[styles.filterChip, selectedSubject === subject && styles.filterChipActive]}
                            onPress={() => setSelectedSubject(subject)}>
                            <Text style={[styles.filterChipText, selectedSubject === subject && styles.filterChipTextActive]}>
                                {subject}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Files List */}
                {filteredFiles.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No files available.</Text>
                    </GlassCard>
                ) : (
                    filteredFiles.map(file => (
                        <TouchableOpacity key={file.id} onPress={() => handleFilePress(file)}>
                            <GlassCard style={styles.fileCard}>
                                <View style={styles.fileRow}>
                                    <Text style={styles.fileIcon}>{getFileIcon(file.file_type)}</Text>
                                    <View style={styles.fileInfo}>
                                        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                        <Text style={styles.fileMeta}>
                                            {file.subject} • {file.file_size || 'N/A'} • {formatDate(file.created_at)}
                                        </Text>
                                    </View>
                                    <Text style={styles.viewAction}>View →</Text>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
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
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: 'rgba(15,23,42,0.7)',
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.4)',
    },
    filterChipActive: {
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderColor: '#38bdf8',
    },
    filterChipText: {
        color: '#9ca3af',
        fontSize: 13,
    },
    filterChipTextActive: {
        color: '#38bdf8',
        fontWeight: '600',
    },
    fileCard: {
        marginBottom: 10,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#f9fafb',
        marginBottom: 4,
    },
    fileMeta: {
        fontSize: 12,
        color: '#6b7280',
    },
    viewAction: {
        fontSize: 13,
        color: '#38bdf8',
        fontWeight: '600',
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

export default FilesScreen;
