import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import { DoubtSolverScreen } from '../screens/student/DoubtSolverScreen';
import AnalysisScreen from '../screens/student/AnalysisScreen';
import HomeworkScreen from '../screens/student/HomeworkScreen';
import ResultsScreen from '../screens/student/ResultsScreen';
import FilesScreen from '../screens/student/FilesScreen';
import PDFViewerScreen from '../screens/shared/PDFViewerScreen';

export type StudentStackParamList = {
  StudentDashboard: undefined;
  DoubtSolver: undefined;
  Analysis: undefined;
  Homework: undefined;
  Results: undefined;
  Files: undefined;
  PDFViewer: { url: string; title?: string };
};

const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f8fafc',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#f8fafc',
        },
      }}>
      <Stack.Screen
        name="StudentDashboard"
        component={StudentDashboardScreen}
        options={{ title: 'Student Hub' }}
      />
      <Stack.Screen
        name="DoubtSolver"
        component={DoubtSolverScreen}
        options={{ title: 'Doubt Solver' }}
      />
      <Stack.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ title: 'Performance Analysis' }}
      />
      <Stack.Screen
        name="Homework"
        component={HomeworkScreen}
        options={{ title: 'Homework' }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Exam Results' }}
      />
      <Stack.Screen
        name="Files"
        component={FilesScreen}
        options={{ title: 'Study Materials' }}
      />
      <Stack.Screen
        name="PDFViewer"
        component={PDFViewerScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StudentNavigator;



