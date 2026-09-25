import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Icons } from '../components/ui/Icons';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import ActivitiesScreen from '../screens/teacher/ActivitiesScreen';
import DecksScreen from '../screens/teacher/DecksScreen';

const Tab = createBottomTabNavigator();

// Placeholder for Menu/Profile screen or trigger
const MenuPlaceholder = () => <View style={{ flex: 1, backgroundColor: '#020617' }} />;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    return (
        <View style={styles.tabContainer}>
            {/* Glass background with semi-transparent effect */}
            <View style={styles.tabBarWrapper}>
                <View style={[StyleSheet.absoluteFill, styles.glassBackground]} />
                <View style={styles.tabBar}>
                    {state.routes.map((route: any, index: number) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        let Icon = Icons.Home;
                        if (route.name === 'Activities') Icon = Icons.CheckCircle;
                        if (route.name === 'Decks') Icon = Icons.Calendar;
                        if (route.name === 'Menu') Icon = Icons.Target;

                        return (
                            <TouchableOpacity
                                key={route.key}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                onPress={onPress}
                                style={styles.tabItem}
                            >
                                <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                                    <Icon
                                        size={24}
                                        color={isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                                        strokeWidth={isFocused ? 2 : 1.5}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const TeacherTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                }
            }}
        >
            <Tab.Screen name="Home" component={TeacherDashboardScreen} />
            <Tab.Screen name="Activities" component={ActivitiesScreen} />
            <Tab.Screen name="Decks" component={DecksScreen} />
            <Tab.Screen name="Menu" component={MenuPlaceholder} listeners={({ navigation }) => ({
                tabPress: (e) => {
                    e.preventDefault();
                    // Open Sidebar here (implementation later)
                    console.log('Open Sidebar');
                }
            })} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        alignItems: 'center',
    },
    tabBarWrapper: {
        width: '100%',
        borderRadius: 9999,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    androidBlurFallback: {
        backgroundColor: 'rgba(31, 41, 55, 0.85)',
    },
    glassBackground: {
        backgroundColor: 'rgba(31, 41, 55, 0.85)',
    },
    tabBar: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    iconContainer: {
        width: 52,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconContainer: {
        backgroundColor: '#1F1F1F',
        borderRadius: 14,
    },
});

export default TeacherTabNavigator;

