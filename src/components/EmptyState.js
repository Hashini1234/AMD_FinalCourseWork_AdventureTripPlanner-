import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing } from '../theme/theme';

export default function EmptyState({ icon = 'compass-outline', title, message }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={64} color={theme.colors.outline} />
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {message ? <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { marginTop: spacing.md, fontWeight: '600' },
  message: { marginTop: spacing.xs, textAlign: 'center' },
});
