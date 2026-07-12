import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import MainTabNavigator from './MainTabNavigator';
import TripDetailScreen from '../screens/trips/TripDetailScreen';
import TripFormScreen from '../screens/trips/TripFormScreen';
import EquipmentChecklistScreen from '../screens/trips/EquipmentChecklistScreen';
import ExpenseSplitterScreen from '../screens/trips/ExpenseSplitterScreen';
import TripMapScreen from '../screens/trips/TripMapScreen';
import LocationPickerScreen from '../screens/trips/LocationPickerScreen';
import GalleryScreen from '../screens/gallery/GalleryScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';

const Stack = createNativeStackNavigator();

export default function MainStackNavigator({ isDarkMode, onToggleDarkMode }) {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
        {(props) => <MainTabNavigator {...props} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />}
      </Stack.Screen>
      <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Trip Details' }} />
      <Stack.Screen name="CreateTrip" component={TripFormScreen} options={{ title: 'New Trip' }} />
      <Stack.Screen name="EditTrip" component={TripFormScreen} options={{ title: 'Edit Trip' }} />
      <Stack.Screen name="Equipment" component={EquipmentChecklistScreen} options={{ title: 'Equipment Checklist' }} />
      <Stack.Screen name="Expenses" component={ExpenseSplitterScreen} options={{ title: 'Expense Splitter' }} />
      <Stack.Screen name="TripMap" component={TripMapScreen} options={{ title: 'Map & Location' }} />
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ title: 'Pick Location' }} />
      <Stack.Screen name="Gallery" component={GalleryScreen} options={{ title: 'Photo Gallery' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}
