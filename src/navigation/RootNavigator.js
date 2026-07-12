import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { TripProvider } from '../context/TripContext';
import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';
import SplashScreen from '../screens/auth/SplashScreen';

export default function RootNavigator({ isDarkMode, onToggleDarkMode, navigationTheme }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? (
        <TripProvider>
          <MainStackNavigator isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
        </TripProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
