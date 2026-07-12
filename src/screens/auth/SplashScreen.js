import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

export default function SplashScreen() {
  return (
    <LinearGradient colors={[colors.darkGreen, colors.green]} style={styles.container}>
      <MaterialCommunityIcons name="image-filter-hdr" size={88} color={colors.amber} />
      <Text style={styles.title}>Adventure Trip Planner</Text>
      <Text style={styles.subtitle}>Plan. Pack. Explore.</Text>
      <ActivityIndicator color={colors.white} style={{ marginTop: 32 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.white, fontSize: 26, fontWeight: '700', marginTop: 16 },
  subtitle: { color: colors.sand, fontSize: 14, marginTop: 4 },
});
