import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Searchbar, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import TripCard from '../../components/TripCard';
import WeatherWidget from '../../components/WeatherWidget';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { isUpcoming } from '../../utils/dateUtils';
import { colors, spacing } from '../../theme/theme';

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900',
];

const QUICK_ACTIONS = [
  { key: 'create', label: 'New Trip', icon: 'plus-circle-outline', screen: 'CreateTrip' },
  { key: 'trips', label: 'My Trips', icon: 'bag-personal-outline', screen: 'TripList' },
  { key: 'gallery', label: 'Gallery', icon: 'image-multiple-outline', screen: 'GalleryTab' },
  { key: 'profile', label: 'Profile', icon: 'account-circle-outline', screen: 'Profile' },
];

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { user, profile } = useAuth();
  const { trips, loading, error, fetchTrips, loadWeatherForDestination, weather } = useTrips();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) fetchTrips(user.uid);
    }, [user?.uid])
  );

  const upcomingTrips = useMemo(() => trips.filter(isUpcoming).sort((a, b) => a.startDate.localeCompare(b.startDate)), [trips]);
  const nextTrip = upcomingTrips[0];
  const recentTrips = useMemo(() => [...trips].reverse().slice(0, 5), [trips]);

  useEffect(() => {
    if (nextTrip?.destination) loadWeatherForDestination(nextTrip.destination);
  }, [nextTrip?.destination]);

  const filteredTrips = searchQuery
    ? trips.filter((t) => t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.destination?.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const firstName = (profile?.name || user?.displayName || 'Explorer').split(' ')[0];

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading.trips} onRefresh={() => fetchTrips(user.uid)} />}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={styles.headerRow}>
          <View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Welcome back,</Text>
            <Text variant="headlineSmall" style={{ fontWeight: '700' }}>{firstName} 👋</Text>
          </View>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={32} color={theme.colors.primary} />
        </View>

        <Searchbar
          placeholder="Search trips by destination or title"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          onSubmitEditing={() => navigation.navigate('TripList', { search: searchQuery })}
        />

        {!searchQuery && (
          <FlatList
            data={CAROUSEL_IMAGES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri) => uri}
            style={styles.carousel}
            renderItem={({ item }) => <Image source={{ uri: item }} style={styles.carouselImage} />}
          />
        )}

        {searchQuery ? (
          <View>
            <Text variant="titleMedium" style={styles.sectionTitle}>Search Results</Text>
            {filteredTrips.length === 0 ? (
              <EmptyState icon="magnify" title="No trips found" message="Try a different destination or title." />
            ) : (
              filteredTrips.map((trip) => (
                <TripCard key={trip.tripId} trip={trip} onPress={() => navigation.navigate('TripDetail', { tripId: trip.tripId })} />
              ))
            )}
          </View>
        ) : (
          <>
            {nextTrip && (
              <View>
                <Text variant="titleMedium" style={styles.sectionTitle}>Upcoming Trip Weather</Text>
                <WeatherWidget weather={weather} loading={loading.weather} error={error.weather} />
              </View>
            )}

            <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity key={action.key} style={styles.actionItem} onPress={() => navigation.navigate(action.screen)}>
                  <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons name={action.icon} size={24} color={theme.colors.primary} />
                  </View>
                  <Text variant="labelSmall" style={{ marginTop: 4 }}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Recent Trips</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TripList')}>
                <Text style={{ color: theme.colors.primary }}>See all</Text>
              </TouchableOpacity>
            </View>

            {loading.trips ? (
              <LoadingSkeleton count={3} />
            ) : recentTrips.length === 0 ? (
              <EmptyState icon="hiking" title="No adventures yet" message="Tap 'New Trip' to plan your first adventure." />
            ) : (
              recentTrips.map((trip) => (
                <TripCard key={trip.tripId} trip={trip} onPress={() => navigation.navigate('TripDetail', { tripId: trip.tripId })} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.md },
  searchbar: { marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: 14 },
  carousel: { marginTop: spacing.md },
  carouselImage: { width: 320, height: 150, borderRadius: 18, marginLeft: spacing.md },
  sectionTitle: { marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: spacing.md },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: spacing.md },
  actionItem: { alignItems: 'center' },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
