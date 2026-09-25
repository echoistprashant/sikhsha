/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/SplashScreen';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils/toast.config';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
          <Toast config={toastConfig} />
        </ThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

