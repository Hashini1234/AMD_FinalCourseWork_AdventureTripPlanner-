import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Button, HelperText, Text } from 'react-native-paper';
import { getCurrentLocation } from '../../services/locationService';
import { spacing } from '../../theme/theme';

const DEFAULT_REGION = {
  // Sri Lanka, used only as a fallback starting point if no coordinates
  // were picked yet and GPS is unavailable.
  latitude: 7.8731,
  longitude: 80.7718,
  latitudeDelta: 3,
  longitudeDelta: 3,
};

export default function LocationPickerScreen({ navigation, route }) {
  const { returnTo, returnToTab, initialLatitude, initialLongitude } = route.params || {};
  const hasInitial = initialLatitude != null && initialLongitude != null;

  const [marker, setMarker] = useState(
    hasInitial ? { latitude: initialLatitude, longitude: initialLongitude } : null
  );
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const initialRegion = hasInitial
    ? { latitude: initialLatitude, longitude: initialLongitude, latitudeDelta: 0.15, longitudeDelta: 0.15 }
    : DEFAULT_REGION;

  const handleMapPress = (event) => {
    setMarker(event.nativeEvent.coordinate);
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setError('');
    try {
      const location = await getCurrentLocation();
      setMarker(location);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = () => {
    if (!marker) {
      setError('Tap anywhere on the map to drop a pin, or use your current location.');
      return;
    }
    if (returnToTab) {
      // The "New Trip" form lives inside the bottom tab navigator, so it
      // needs the nested { screen, params } navigate syntax to reach it.
      navigation.navigate('MainTabs', { screen: returnTo, params: { pickedLocation: marker } });
    } else {
      navigation.navigate(returnTo, { pickedLocation: marker });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {marker && (
          // Keying on the coordinate forces a fresh Marker on Android, which
          // can otherwise fail to visually reposition an existing marker.
          <Marker
            key={`${marker.latitude}-${marker.longitude}`}
            coordinate={marker}
            draggable
            onDragEnd={handleMapPress}
            pinColor="#E76F51"
          />
        )}
      </MapView>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.hint}>
          Tap the map to drop a pin, or drag the marker to fine-tune it.
        </Text>
        {marker && (
          <Text variant="bodySmall" style={styles.coords}>
            📍 {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
          </Text>
        )}
        <HelperText type="error" visible={!!error}>{error}</HelperText>

        <Button mode="outlined" icon="crosshairs-gps" onPress={handleUseCurrentLocation} loading={locating} style={styles.button}>
          Use Current GPS Location
        </Button>
        <Button mode="contained" icon="check" onPress={handleConfirm} style={styles.button} contentStyle={{ paddingVertical: 6 }}>
          Confirm Location
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  footer: { padding: spacing.md },
  hint: { textAlign: 'center', marginBottom: spacing.xs },
  coords: { textAlign: 'center', marginBottom: spacing.xs, fontWeight: '600' },
  button: { marginTop: spacing.sm, borderRadius: 12 },
});
