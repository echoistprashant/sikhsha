import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import { QuestionGeneratorScreen } from '../screens/teacher/QuestionGeneratorScreen';
import { DeckGeneratorScreen } from '../screens/teacher/DeckGeneratorScreen';
import { ActivityGeneratorScreen } from '../screens/teacher/ActivityGeneratorScreen';
import AttendanceScreen from '../screens/teacher/AttendanceScreen';
import AttendanceHistoryScreen from '../screens/teacher/AttendanceHistoryScreen';
import DecksScreen from '../screens/teacher/DecksScreen';
import DeckDetailScreen from '../screens/teacher/DeckDetailScreen';
import ActivitiesScreen from '../screens/teacher/ActivitiesScreen';
import ActivityDetailScreen from '../screens/teacher/ActivityDetailScreen';
import LessonPlansScreen from '../screens/teacher/LessonPlansScreen';
import LessonPlanDetailScreen from '../screens/teacher/LessonPlanDetailScreen';
import ConceptLibraryScreen from '../screens/teacher/ConceptLibraryScreen';
import ConceptDetailScreen from '../screens/teacher/ConceptDetailScreen';
import AssignHomeworkScreen from '../screens/teacher/AssignHomeworkScreen';
import UpdateResultScreen from '../screens/teacher/UpdateResultScreen';
import TeacherTabNavigator from './TeacherTabNavigator';
import { useTheme } from '../context/ThemeContext';

export type TeacherStackParamList = {
  TeacherTabs: undefined;
  TeacherDashboard: undefined;
  QuestionGenerator: undefined;
  DeckGenerator: undefined;
  Decks: undefined;
  DeckDetail: { deckId: string };
  ActivityGenerator: undefined;
  Activities: undefined;
  ActivityDetail: { activityId: string };
  LessonPlans: undefined;
  LessonPlanDetail: { planId: string };
  Attendance: undefined;
  AttendanceHistory: undefined;
  ConceptLibrary: undefined;
  ConceptDetail: { conceptId: string };
  AssignHomework: undefined;
  UpdateResult: undefined;
};

const Stack = createNativeStackNavigator<TeacherStackParamList>();

const TeacherNavigator = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We hide header here because TabNavigator handles it or individual screens do
        contentStyle: {
          backgroundColor: colors.background, // Match theme
        },
      }}>
      <Stack.Screen
        name="TeacherTabs"
        component={TeacherTabNavigator}
      />
      {/* Other screens that are NOT in the tabs but part of the stack */}
      <Stack.Screen
        name="QuestionGenerator"
        component={QuestionGeneratorScreen}
        options={{ headerShown: true, title: 'Question Generator' }}
      />
      <Stack.Screen
        name="DeckGenerator"
        component={DeckGeneratorScreen}
        options={{ headerShown: true, title: 'Deck Generator' }}
      />
      <Stack.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{ headerShown: true, title: 'Deck Details' }}
      />
      <Stack.Screen
        name="ActivityGenerator"
        component={ActivityGeneratorScreen}
        options={{ headerShown: true, title: 'Activity Generator' }}
      />
      <Stack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{ headerShown: true, title: 'Activity Details' }}
      />
      <Stack.Screen
        name="LessonPlans"
        component={LessonPlansScreen}
        options={{ headerShown: true, title: 'Lesson Plans' }}
      />
      <Stack.Screen
        name="LessonPlanDetail"
        component={LessonPlanDetailScreen}
        options={{ headerShown: true, title: 'Lesson Plan Details' }}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ headerShown: true, title: 'Mark Attendance' }}
      />
      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{ headerShown: true, title: 'Attendance History' }}
      />
      <Stack.Screen
        name="ConceptLibrary"
        component={ConceptLibraryScreen}
        options={{ headerShown: true, title: 'Concept Library' }}
      />
      <Stack.Screen
        name="ConceptDetail"
        component={ConceptDetailScreen}
        options={{ headerShown: true, title: 'Concept Detail' }}
      />
      <Stack.Screen
        name="AssignHomework"
        component={AssignHomeworkScreen}
        options={{ headerShown: true, title: 'Assign Homework' }}
      />
      <Stack.Screen
        name="UpdateResult"
        component={UpdateResultScreen}
        options={{ headerShown: true, title: 'Update Results' }}
      />
    </Stack.Navigator>
  );
};

export default TeacherNavigator;
