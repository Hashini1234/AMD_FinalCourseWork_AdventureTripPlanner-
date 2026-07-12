import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Divider, List, Switch, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import { resetMockDatabase } from '../../mock/mockDatabase';
import { colors, spacing } from '../../theme/theme';

export default function ProfileScreen({ navigation, isDarkMode, onToggleDarkMode }) {
  const theme = useTheme();
  const { user, profile, logout } = useAuth();
  const { trips } = useTrips();

  const name = profile?.name || user?.displayName || 'Explorer';
  const email = user?.email || '';
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleResetDemoData = () => {
    Alert.alert(
      'Reset Mock Data',
      'This clears all local trips, accounts, and photos and restores the original demo data. You will be logged out. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetMockDatabase();
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView>
        <LinearGradient colors={[colors.darkGreen, colors.green]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.avatarWrapper}>
            {profile?.photoUrl ? (
              <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} />
            ) : (
              <Avatar.Text size={72} label={initials} style={{ backgroundColor: colors.amber }} labelStyle={{ color: colors.darkGreen, fontWeight: '700' }} />
            )}
            <View style={[styles.editBadge, { backgroundColor: colors.amber }]}>
              <MaterialCommunityIcons name="pencil" size={14} color={colors.darkGreen} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.tripCount}>{trips.length} trip{trips.length === 1 ? '' : 's'} planned</Text>
        </LinearGradient>

        <View style={styles.section}>
          <List.Item
            title="Edit Profile"
            description="Change your name and profile photo"
            left={(props) => <List.Icon {...props} icon="account-edit-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <Divider />
          <List.Item
            title="Notification Settings"
            description="Manage reminders and test notifications"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <Divider />
          <List.Item
            title="Dark Mode"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => <Switch value={isDarkMode} onValueChange={onToggleDarkMode} />}
          />
          <Divider />
          <List.Item
            title="Authentication Provider"
            description="Mock Email & Password"
            left={(props) => <List.Icon {...props} icon="shield-account-outline" />}
          />
          <Divider />
          <List.Item
            title="Backend"
            description="Local mock server (AsyncStorage)"
            left={(props) => <List.Icon {...props} icon="server-outline" />}
          />
        </View>

        <Button mode="outlined" icon="logout" textColor={theme.colors.error} onPress={handleLogout} style={styles.logoutButton}>
          Log Out
        </Button>
        <Button mode="text" icon="restore" textColor={theme.colors.onSurfaceVariant} onPress={handleResetDemoData} style={styles.resetButton}>
          Reset Mock Data
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: spacing.xl, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  avatarWrapper: { position: 'relative' },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  editBadge: { position: 'absolute', right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  name: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: spacing.sm },
  email: { color: colors.sand, marginTop: 2 },
  tripCount: { color: colors.sand, marginTop: spacing.sm, fontSize: 12 },
  section: { marginTop: spacing.md },
  logoutButton: { marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: 12 },
  resetButton: { marginHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.lg },
});
