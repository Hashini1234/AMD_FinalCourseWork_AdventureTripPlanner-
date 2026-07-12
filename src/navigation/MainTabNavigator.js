import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import HomeScreen from '../screens/home/HomeScreen';
import TripListScreen from '../screens/trips/TripListScreen';
import TripFormScreen from '../screens/trips/TripFormScreen';
import GalleryScreen from '../screens/gallery/GalleryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home-variant-outline',
  TripList: 'bag-personal-outline',
  CreateTripTab: 'plus-circle-outline',
  GalleryTab: 'image-multiple-outline',
  Profile: 'account-circle-outline',
};

export default function MainTabNavigator({ isDarkMode, onToggleDarkMode }) {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="TripList" component={TripListScreen} options={{ tabBarLabel: 'My Trips' }} />
      <Tab.Screen
        name="CreateTripTab"
        component={TripFormScreen}
        options={{ tabBarLabel: 'New Trip' }}
      />
      <Tab.Screen name="GalleryTab" component={GalleryScreen} options={{ tabBarLabel: 'Gallery' }} />
      <Tab.Screen name="Profile" options={{ tabBarLabel: 'Profile' }}>
        {(props) => <ProfileScreen {...props} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
