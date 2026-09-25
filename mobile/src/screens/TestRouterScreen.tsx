import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import GlassScreen from '../components/GlassScreen';
import GlassCard from '../components/GlassCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const TestRouterScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const teacherScreens = [
        { name: 'TeacherDashboard', label: 'Teacher Dashboard' },
        { name: 'DeckGenerator', label: 'Deck Generator' },
        { name: 'Decks', label: 'Decks List' },
        { name: 'ActivityGenerator', label: 'Activity Generator' },
        { name: 'Activities', label: 'Activities List' },
        { name: 'Attendance', label: 'Mark Attendance' },
        { name: 'AttendanceHistory', label: 'Attendance History' },
        { name: 'LessonPlans', label: 'Lesson Plans' },
        { name: 'ConceptLibrary', label: 'Concept Library' },
    ];

    const studentScreens = [
        { name: 'StudentDashboard', label: 'Student Dashboard' },
        { name: 'DoubtSolver', label: 'Doubt Solver' },
        { name: 'Doubts', label: 'Doubts History' },
        { name: 'WeakAreas', label: 'Weak Areas' },
    ];

    const adminScreens = [
        { name: 'AdminDashboard', label: 'Admin Dashboard' },
        { name: 'Users', label: 'Users Management' },
        { name: 'Schools', label: 'Schools Management' },
        { name: 'Analytics', label: 'Analytics' },
        { name: 'AdminAttendance', label: 'Attendance Overview' },
    ];

    const renderSection = (title: string, screens: { name: string; label: string }[]) => (
        <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {screens.map((screen) => (
                <TouchableOpacity
                    key={screen.name}
                    style={styles.button}
                    onPress={() => {
                        try {
                            navigation.navigate(screen.name as never);
                        } catch (error) {
                            console.error(`Failed to navigate to ${screen.name}:`, error);
                        }
                    }}>
                    <Text style={styles.buttonText}>{screen.label}</Text>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
            ))}
        </GlassCard>
    );

    return (
        <GlassScreen>
            <View style={styles.header}>
                <Text style={styles.title}>🧪 Test Router</Text>
                <Text style={styles.subtitle}>
                    Navigate to any screen for testing
                </Text>
            </View>

            <ScrollView style={styles.scrollView}>
                {renderSection('👨‍🏫 Teacher Screens', teacherScreens)}
                {renderSection('👨‍🎓 Student Screens', studentScreens)}
                {renderSection('👔 Admin Screens', adminScreens)}
            </ScrollView>
        </GlassScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#38bdf8',
        marginBottom: 12,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(30,64,175,0.3)',
    },
    buttonText: {
        fontSize: 16,
        color: '#e5e7eb',
        fontWeight: '500',
    },
    arrow: {
        fontSize: 18,
        color: '#38bdf8',
    },
});

export default TestRouterScreen;
