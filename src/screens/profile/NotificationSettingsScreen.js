import React, { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, List, Switch, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import {
  getNotificationPreferences,
  setNotificationPreferences,
  getPermissionStatus,
  sendTestNotification,
} from '../../services/notificationService';
import { spacing } from '../../theme/theme';

export default function NotificationSettingsScreen() {
  const theme = useTheme();
  const [preferences, setPreferences] = useState({ tripReminders: true, packingReminders: true });
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [sending, setSending] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getNotificationPreferences().then(setPreferences);
      getPermissionStatus().then(setPermissionStatus);
    }, [])
  );

  const updatePreference = async (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await setNotificationPreferences(updated);
  };

  const handleTestNotification = async () => {
    setSending(true);
    setSentConfirmation(false);
    await sendTestNotification();
    const status = await getPermissionStatus();
    setPermissionStatus(status);
    setSending(false);
    if (status === 'granted') setSentConfirmation(true);
  };

  const isDenied = permissionStatus === 'denied';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.statusBanner}>
          <Text variant="labelLarge">
            Permission status: {' '}
            <Text style={{ color: isDenied ? theme.colors.error : theme.colors.primary, fontWeight: '700' }}>
              {permissionStatus === 'granted' ? 'Enabled' : permissionStatus === 'denied' ? 'Denied' : 'Not set yet'}
            </Text>
          </Text>
          {isDenied && (
            <Button mode="text" onPress={() => Linking.openSettings()} compact style={{ marginTop: spacing.xs }}>
              Open Device Settings
            </Button>
          )}
        </View>

        <List.Item
          title="Trip Start Reminders"
          description="Notify me the day before a trip begins"
          left={(props) => <List.Icon {...props} icon="calendar-alert" />}
          right={() => (
            <Switch
              value={preferences.tripReminders}
              onValueChange={(value) => updatePreference('tripReminders', value)}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Packing Checklist Reminders"
          description="Notify me about unpacked equipment"
          left={(props) => <List.Icon {...props} icon="bag-checked" />}
          right={() => (
            <Switch
              value={preferences.packingReminders}
              onValueChange={(value) => updatePreference('packingReminders', value)}
            />
          )}
        />

        <Button
          mode="contained"
          icon="bell-ring-outline"
          onPress={handleTestNotification}
          loading={sending}
          style={styles.testButton}
          contentStyle={{ paddingVertical: 6 }}
        >
          Send Test Notification
        </Button>
        {sentConfirmation && (
          <Text style={styles.confirmation}>Sent! It should arrive in a few seconds.</Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusBanner: { padding: spacing.lg },
  testButton: { marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: 12 },
  confirmation: { textAlign: 'center', marginTop: spacing.sm },
});
