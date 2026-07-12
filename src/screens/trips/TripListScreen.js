import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Chip, FAB, Searchbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import TripCard from '../../components/TripCard';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { activityTypes, spacing } from '../../theme/theme';

export default function TripListScreen({ navigation, route }) {
  const { user } = useAuth();
  const { trips, loading, fetchTrips } = useTrips();
  const [searchQuery, setSearchQuery] = useState(route.params?.search || '');
  const [activeFilter, setActiveFilter] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) fetchTrips(user.uid);
    }, [user?.uid])
  );

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch = !searchQuery ||
        trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = !activeFilter || trip.activityType === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [trips, searchQuery, activeFilter]);

  return (
    <ScreenContainer>
      <Searchbar
        placeholder="Search by destination or title"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={activityTypes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <Chip
            icon={item.icon}
            selected={activeFilter === item.value}
            onPress={() => setActiveFilter(activeFilter === item.value ? null : item.value)}
            style={styles.filterChip}
          >
            {item.label}
          </Chip>
        )}
      />

      {loading.trips ? (
        <LoadingSkeleton count={4} />
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.tripId}
          contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TripCard trip={item} onPress={() => navigation.navigate('TripDetail', { tripId: item.tripId })} />
          )}
          ListEmptyComponent={
            <EmptyState icon="hiking" title="No trips found" message="Try adjusting your search or filters, or create a new trip." />
          }
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('CreateTrip')} label="New Trip" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchbar: { marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: 14 },
  filterRow: { marginTop: spacing.sm, flexGrow: 0 },
  filterChip: { marginRight: spacing.sm },
  fab: { position: 'absolute', right: spacing.md, bottom: spacing.md },
});
