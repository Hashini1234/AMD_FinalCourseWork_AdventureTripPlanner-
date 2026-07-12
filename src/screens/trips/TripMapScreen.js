import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Button, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import EmptyState from '../../components/EmptyState';
import { getCurrentLocation } from '../../services/locationService';
import { spacing } from '../../theme/theme';

export default function TripMapScreen({ route }) {
  const { tripId } = route.params;
  const { trips, fetchTripDetail } = useTrips();
  const trip = trips.find((t) => t.tripId === tripId);
  const [currentLocation, setCurrentLocation] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchTripDetail(tripId);
    }, [tripId])
  );

  useEffect(() => {
    getCurrentLocation().then(setCurrentLocation).catch(() => {});
  }, []);

  if (!trip || trip.latitude == null || trip.longitude == null) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="map-marker-off-outline"
          title="No coordinates saved"
          message="Edit this trip and use 'Use Current GPS Location' to save destination coordinates."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: trip.latitude,
          longitude: trip.longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
      >
        <Marker
          coordinate={{ latitude: trip.latitude, longitude: trip.longitude }}
          title={trip.title}
          description={trip.destination}
          pinColor="#E76F51"
        />
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="You are here"
            pinColor="#2D6A4F"
          />
        )}
      </MapView>
      <View style={styles.footer}>
        <Text variant="bodySmall">📍 Destination: {trip.destination}</Text>
        <Text variant="bodySmall">🧭 {trip.latitude.toFixed(4)}, {trip.longitude.toFixed(4)}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  footer: { padding: spacing.md },
});
