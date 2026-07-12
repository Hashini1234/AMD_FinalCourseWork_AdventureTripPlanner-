import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { weatherIconUrl } from '../services/weatherService';
import { colors, radius, spacing } from '../theme/theme';

export default function WeatherWidget({ weather, loading, error }) {
  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator />
        <Text style={{ marginTop: spacing.sm }}>Fetching live weather...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, styles.center]}>
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    );
  }

  if (!weather) return null;

  return (
    <LinearGradient colors={[colors.darkGreen, colors.green]} style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.location}>{weather.location || weather.name}</Text>
          <Text style={styles.temp}>{weather.temperature}°C</Text>
          <Text style={styles.condition}>{weather.description}</Text>
        </View>
        <Image source={{ uri: weatherIconUrl(weather.icon) }} style={styles.icon} />
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.meta}>Feels like {weather.feelsLike}°C</Text>
        <Text style={styles.meta}>Humidity {weather.humidity}%</Text>
        <Text style={styles.meta}>Wind {weather.windSpeed} m/s</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.md },
  center: { alignItems: 'center', justifyContent: 'center', minHeight: 100 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  location: { color: colors.white, fontSize: 14, opacity: 0.9 },
  temp: { color: colors.white, fontSize: 34, fontWeight: '700' },
  condition: { color: colors.white, textTransform: 'capitalize' },
  icon: { width: 64, height: 64 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: spacing.sm },
  meta: { color: colors.white, fontSize: 12 },
});
