import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AttendanceScreen from '../screens/admin/AttendanceScreen';
import UsersScreen from '../screens/admin/UsersScreen';


export type AdminTabParamList = {
  AdminDashboard: undefined;
  Analytics: undefined;
  Attendance: undefined;
  Users: undefined;

};

export type AdminStackParamList = {
  AdminTabs: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderTopColor: 'rgba(148, 163, 184, 0.35)',
          borderTopWidth: 1,
          position: 'absolute',
          elevation: 0,
        },
        tabBarActiveTintColor: '#e5e7eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}>
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📈</Text>,
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✓</Text>,
        }}
      />
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      />

    </Tab.Navigator>
  );
};

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
