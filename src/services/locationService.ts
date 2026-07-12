import * as Location from 'expo-location';
import type { GeoPoint, ReverseGeocodeResult } from '../types';

export async function getCurrentLocation(): Promise<GeoPoint> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission was denied. You can still enter coordinates manually.');
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null> {
  const results = await Location.reverseGeocodeAsync({ latitude, longitude });
  if (!results.length) return null;
  const place = results[0];
  return {
    city: place.city || place.subregion || '',
    country: place.country || '',
  };
}
