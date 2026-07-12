import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { DefaultTheme as NavLightTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { lightTheme, darkTheme } from './src/theme/theme';

const navLightTheme = {
  ...NavLightTheme,
  colors: { ...NavLightTheme.colors, primary: lightTheme.colors.primary, background: lightTheme.colors.background },
};
const navDarkTheme = {
  ...NavDarkTheme,
  colors: { ...NavDarkTheme.colors, primary: darkTheme.colors.primary, background: darkTheme.colors.background },
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const paperTheme = isDarkMode ? darkTheme : lightTheme;
  const navigationTheme = isDarkMode ? navDarkTheme : navLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AuthProvider>
            <RootNavigator
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode((v) => !v)}
              navigationTheme={navigationTheme}
            />
          </AuthProvider>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
