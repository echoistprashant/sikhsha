import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import TeacherNavigator from './TeacherNavigator';
import StudentNavigator from './StudentNavigator';
import AdminNavigator from './AdminNavigator';
import TestNavigator from './TestNavigator';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Auth: undefined;
  Teacher: undefined;
  Student: undefined;
  Admin: undefined;
  Test: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Set this to true to enable test router (bypasses authentication for UI testing)
// const ENABLE_TEST_ROUTER = true;
const ENABLE_TEST_ROUTER = false;

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e5e7eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {ENABLE_TEST_ROUTER ? (
        <Stack.Screen name="Test" component={TestNavigator} />
      ) : !user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'teacher' ? (
        <Stack.Screen name="Teacher" component={TeacherNavigator} />
      ) : user.role === 'student' ? (
        <Stack.Screen name="Student" component={StudentNavigator} />
      ) : (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
});

export default RootNavigator;
