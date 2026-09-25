import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestRouterScreen from '../screens/TestRouterScreen';

// Teacher Screens
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import { DeckGeneratorScreen } from '../screens/teacher/DeckGeneratorScreen';
import { ActivityGeneratorScreen } from '../screens/teacher/ActivityGeneratorScreen';
import AttendanceScreen from '../screens/teacher/AttendanceScreen';
import AttendanceHistoryScreen from '../screens/teacher/AttendanceHistoryScreen';
import DecksScreen from '../screens/teacher/DecksScreen';
import ActivitiesScreen from '../screens/teacher/ActivitiesScreen';
import LessonPlansScreen from '../screens/teacher/LessonPlansScreen';
import ConceptLibraryScreen from '../screens/teacher/ConceptLibraryScreen';
import ConceptDetailScreen from '../screens/teacher/ConceptDetailScreen';

// Student Screens
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import { DoubtSolverScreen } from '../screens/student/DoubtSolverScreen';
import DoubtsScreen from '../screens/student/DoubtsScreen';
import DoubtDetailScreen from '../screens/student/DoubtDetailScreen';
import WeakAreasScreen from '../screens/student/WeakAreasScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AdminAttendanceScreen from '../screens/admin/AttendanceScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import SchoolsScreen from '../screens/admin/SchoolsScreen';

export type TestNavigatorParamList = {
    TestHome: undefined;
    // Teacher Screens
    TeacherDashboard: undefined;
    DeckGenerator: undefined;
    Decks: undefined;
    ActivityGenerator: undefined;
    Activities: undefined;
    Attendance: undefined;
    AttendanceHistory: undefined;
    LessonPlans: undefined;
    ConceptLibrary: undefined;
    ConceptDetail: { conceptId: string };
    // Student Screens
    StudentDashboard: undefined;
    DoubtSolver: undefined;
    Doubts: undefined;
    DoubtDetail: { doubtId: string };
    WeakAreas: undefined;
    // Admin Screens
    AdminDashboard: undefined;
    Analytics: undefined;
    AdminAttendance: undefined;
    Users: undefined;
    Schools: undefined;
};

const Stack = createNativeStackNavigator<TestNavigatorParamList>();

const TestNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            initialRouteName="TestHome"
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#020617',
                },
                headerTintColor: '#e5e7eb',
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: '#020617',
                },
            }}>
            <Stack.Screen
                name="TestHome"
                component={TestRouterScreen}
                options={{ title: '🧪 Test Router' }}
            />

            {/* Teacher Screens */}
            <Stack.Screen
                name="TeacherDashboard"
                component={TeacherDashboardScreen}
                options={{ title: 'Teacher Dashboard' }}
            />
            <Stack.Screen
                name="DeckGenerator"
                component={DeckGeneratorScreen}
                options={{ title: 'Deck Generator' }}
            />
            <Stack.Screen
                name="Decks"
                component={DecksScreen}
                options={{ title: 'Decks' }}
            />
            <Stack.Screen
                name="ActivityGenerator"
                component={ActivityGeneratorScreen}
                options={{ title: 'Activity Generator' }}
            />
            <Stack.Screen
                name="Activities"
                component={ActivitiesScreen}
                options={{ title: 'Activities' }}
            />
            <Stack.Screen
                name="Attendance"
                component={AttendanceScreen}
                options={{ title: 'Mark Attendance' }}
            />
            <Stack.Screen
                name="AttendanceHistory"
                component={AttendanceHistoryScreen}
                options={{ title: 'Attendance History' }}
            />
            <Stack.Screen
                name="LessonPlans"
                component={LessonPlansScreen}
                options={{ title: 'Lesson Plans' }}
            />
            <Stack.Screen
                name="ConceptLibrary"
                component={ConceptLibraryScreen}
                options={{ title: 'Concept Library' }}
            />
            <Stack.Screen
                name="ConceptDetail"
                component={ConceptDetailScreen}
                options={{ title: 'Concept Detail' }}
            />

            {/* Student Screens */}
            <Stack.Screen
                name="StudentDashboard"
                component={StudentDashboardScreen}
                options={{ title: 'Student Dashboard' }}
            />
            <Stack.Screen
                name="DoubtSolver"
                component={DoubtSolverScreen}
                options={{ title: 'Doubt Solver' }}
            />
            <Stack.Screen
                name="Doubts"
                component={DoubtsScreen}
                options={{ title: 'Doubts History' }}
            />
            <Stack.Screen
                name="DoubtDetail"
                component={DoubtDetailScreen}
                options={{ title: 'Doubt Detail' }}
            />
            <Stack.Screen
                name="WeakAreas"
                component={WeakAreasScreen}
                options={{ title: 'Weak Areas' }}
            />

            {/* Admin Screens */}
            <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{ title: 'Admin Dashboard' }}
            />
            <Stack.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{ title: 'Analytics' }}
            />
            <Stack.Screen
                name="AdminAttendance"
                component={AdminAttendanceScreen}
                options={{ title: 'Attendance' }}
            />
            <Stack.Screen
                name="Users"
                component={UsersScreen}
                options={{ title: 'Users' }}
            />
            <Stack.Screen
                name="Schools"
                component={SchoolsScreen}
                options={{ title: 'Schools' }}
            />
        </Stack.Navigator>
    );
};

export default TestNavigator;
