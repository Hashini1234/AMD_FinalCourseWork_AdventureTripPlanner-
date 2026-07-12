import React, { useCallback, useEffect } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import WeatherWidget from '../../components/WeatherWidget';
import { formatDateRange } from '../../utils/dateUtils';
import { activityTypes, spacing } from '../../theme/theme';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800';

const MENU_ITEMS = [
  { key: 'Equipment', label: 'Equipment Checklist', icon: 'checkbox-marked-outline' },
  { key: 'Expenses', label: 'Expense Splitter', icon: 'cash-multiple' },
  { key: 'TripMap', label: 'Map & Location', icon: 'map-marker-radius-outline' },
  { key: 'Gallery', label: 'Photo Gallery', icon: 'image-multiple-outline' },
];

export default function TripDetailScreen({ navigation, route }) {
  const theme = useTheme();
  const { tripId } = route.params;
  const { trips, selectedTrip, selectTrip, fetchTripDetail, removeTrip, weather, loading, error, loadWeatherForCoords, loadWeatherForDestination } = useTrips();

  const trip = trips.find((t) => t.tripId === tripId) || selectedTrip;

  useFocusEffect(
    useCallback(() => {
      const found = trips.find((t) => t.tripId === tripId);
      if (found) selectTrip(found);
      fetchTripDetail(tripId);
    }, [tripId, trips])
  );

  useEffect(() => {
    if (!trip) return;
    if (trip.latitude != null && trip.longitude != null) {
      loadWeatherForCoords(trip.latitude, trip.longitude);
    } else if (trip.destination) {
      loadWeatherForDestination(trip.destination);
    }
  }, [trip?.tripId]);

  if (!trip) return null;

  const activity = activityTypes.find((a) => a.value === trip.activityType);

  const handleDelete = () => {
    Alert.alert('Delete Trip', `Delete "${trip.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await removeTrip(tripId);
          if (result.success) navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Image source={{ uri: trip.coverImage || FALLBACK_IMAGE }} style={styles.heroImage} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text variant="headlineSmall" style={{ fontWeight: '700', flex: 1 }}>{trip.title}</Text>
            <Chip icon={activity?.icon || 'map-marker'}>{trip.activityType}</Chip>
          </View>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.colors.onSurfaceVariant} />
            <Text style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
              {trip.destination}{trip.country ? `, ${trip.country}` : ''}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-range" size={18} color={theme.colors.onSurfaceVariant} />
            <Text style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
              {formatDateRange(trip.startDate, trip.endDate)}
            </Text>
          </View>

          {!!trip.description && (
            <Text variant="bodyMedium" style={styles.description}>{trip.description}</Text>
          )}
        </View>

        <WeatherWidget weather={weather} loading={loading.weather} error={error.weather} />

        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate(item.key, { tripId })}
            >
              <MaterialCommunityIcons name={item.icon} size={26} color={theme.colors.primary} />
              <Text variant="labelMedium" style={{ marginTop: 6, textAlign: 'center' }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Button mode="outlined" icon="pencil-outline" onPress={() => navigation.navigate('EditTrip', { trip })} style={styles.actionButton}>
            Edit Trip
          </Button>
          <Button mode="outlined" icon="delete-outline" textColor={theme.colors.error} onPress={handleDelete} style={styles.actionButton}>
            Delete
          </Button>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroImage: { width: '100%', height: 220 },
  content: { padding: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  description: { marginTop: spacing.md, lineHeight: 20 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm, justifyContent: 'space-between' },
  menuCard: { width: '48%', borderRadius: 16, alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.sm, elevation: 1 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginTop: spacing.md },
  actionButton: { flex: 0.48, borderRadius: 12 },
});
