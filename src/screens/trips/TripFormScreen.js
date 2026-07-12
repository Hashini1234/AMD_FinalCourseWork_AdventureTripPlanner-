import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import { getCurrentLocation, reverseGeocode } from '../../services/locationService';
import { scheduleTripStartReminder } from '../../services/notificationService';
import { validateTripForm } from '../../utils/validators';
import { activityTypes, spacing } from '../../theme/theme';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800';

export default function TripFormScreen({ navigation, route }) {
  const theme = useTheme();
  const { user } = useAuth();
  const { createTrip, editTrip, loading, error } = useTrips();
  const existingTrip = route.params?.trip;
  const isEditing = !!existingTrip;

  const [title, setTitle] = useState(existingTrip?.title || '');
  const [destination, setDestination] = useState(existingTrip?.destination || '');
  const [country, setCountry] = useState(existingTrip?.country || '');
  const [activityType, setActivityType] = useState(existingTrip?.activityType || '');
  const [description, setDescription] = useState(existingTrip?.description || '');
  const [startDate, setStartDate] = useState(existingTrip?.startDate || '');
  const [endDate, setEndDate] = useState(existingTrip?.endDate || '');
  const [coverImage, setCoverImage] = useState(existingTrip?.coverImage || '');
  const [coords, setCoords] = useState({ latitude: existingTrip?.latitude ?? null, longitude: existingTrip?.longitude ?? null });
  const [locating, setLocating] = useState(false);
  const [showPicker, setShowPicker] = useState(null); // 'start' | 'end' | null
  const [fieldErrors, setFieldErrors] = useState({});
  const [locationError, setLocationError] = useState('');

  // The "New Trip" tab keeps this screen mounted (so pushing LocationPicker
  // on top for the map picker doesn't wipe in-progress edits) - so after a
  // successful create from that tab, clear the fields back to blank
  // ourselves instead of relying on unmount/remount to do it.
  const resetForm = () => {
    setTitle('');
    setDestination('');
    setCountry('');
    setActivityType('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setCoverImage('');
    setCoords({ latitude: null, longitude: null });
    setFieldErrors({});
    setLocationError('');
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true });
    if (!result.canceled) setCoverImage(result.assets[0].uri);
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setLocationError('');
    try {
      const location = await getCurrentLocation();
      await applyPickedCoords(location);
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLocating(false);
    }
  };

  const applyPickedCoords = async (location) => {
    setCoords(location);
    const place = await reverseGeocode(location.latitude, location.longitude).catch(() => null);
    if (place?.city && !destination) setDestination(place.city);
    if (place?.country && !country) setCountry(place.country);
  };

  // Receives the coordinate picked on the LocationPicker map screen, passed
  // back via navigation params (see LocationPickerScreen's handleConfirm).
  useEffect(() => {
    if (route.params?.pickedLocation) {
      applyPickedCoords(route.params.pickedLocation);
      navigation.setParams({ pickedLocation: undefined });
    }
  }, [route.params?.pickedLocation]);

  const handlePickOnMap = () => {
    navigation.navigate('LocationPicker', {
      returnTo: route.name,
      // "New Trip" (bottom tab) renders this same form nested inside the
      // tab navigator, so returning to it needs the nested navigate syntax.
      returnToTab: route.name === 'CreateTripTab',
      initialLatitude: coords.latitude,
      initialLongitude: coords.longitude,
    });
  };

  const handleSave = async () => {
    const errors = validateTripForm({ title, destination, activityType, startDate, endDate });
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const tripData = {
      title: title.trim(),
      destination: destination.trim(),
      country: country.trim(),
      activityType,
      description: description.trim(),
      startDate,
      endDate,
      latitude: coords.latitude,
      longitude: coords.longitude,
      coverImage: coverImage || null,
    };

    const result = isEditing
      ? await editTrip(existingTrip.tripId, tripData)
      : await createTrip(user.uid, tripData);

    if (result.success) {
      const tripForReminder = { ...tripData, tripId: isEditing ? existingTrip.tripId : result.tripId };
      scheduleTripStartReminder(tripForReminder).catch(() => {});
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Reached from the "New Trip" tab (no back stack) - clear the form
        // and jump to the trip list instead.
        resetForm();
        navigation.navigate('TripList');
      }
    }
  };

  const onDateChange = (field) => (event, selectedDate) => {
    setShowPicker(null);
    if (event.type === 'dismissed' || !selectedDate) return;
    const iso = selectedDate.toISOString().slice(0, 10);
    if (field === 'start') setStartDate(iso);
    else setEndDate(iso);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={handlePickImage}>
          <Image source={{ uri: coverImage || FALLBACK_IMAGE }} style={styles.coverImage} />
          <View style={styles.coverOverlay}>
            <MaterialCommunityIcons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.coverOverlayText}>Change cover photo</Text>
          </View>
        </TouchableOpacity>

        <TextInput label="Trip Title" mode="outlined" value={title} onChangeText={setTitle} style={styles.input} error={!!fieldErrors.title} />
        <HelperText type="error" visible={!!fieldErrors.title}>{fieldErrors.title}</HelperText>

        <TextInput label="Destination" mode="outlined" value={destination} onChangeText={setDestination} style={styles.input} error={!!fieldErrors.destination} />
        <HelperText type="error" visible={!!fieldErrors.destination}>{fieldErrors.destination}</HelperText>

        <TextInput label="Country" mode="outlined" value={country} onChangeText={setCountry} style={styles.input} />

        <View style={styles.locationRow}>
          <Button
            mode="outlined"
            icon="crosshairs-gps"
            onPress={handleUseCurrentLocation}
            loading={locating}
            style={styles.locationButton}
          >
            Use GPS
          </Button>
          <Button
            mode="outlined"
            icon="map-marker-radius-outline"
            onPress={handlePickOnMap}
            style={styles.locationButton}
          >
            Pick on Map
          </Button>
        </View>
        {coords.latitude != null && (
          <Text variant="bodySmall" style={styles.coordsText}>
            📍 {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
          </Text>
        )}
        <HelperText type="error" visible={!!locationError}>{locationError}</HelperText>

        <Text variant="labelLarge" style={styles.label}>Activity Type</Text>
        <View style={styles.chipRow}>
          {activityTypes.map((item) => {
            const isSelected = activityType === item.value;
            return (
              <Chip
                key={item.value}
                icon={item.icon}
                mode={isSelected ? 'flat' : 'outlined'}
                selected={isSelected}
                onPress={() => setActivityType(item.value)}
                style={[
                  styles.chip,
                  isSelected
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
                ]}
                textStyle={isSelected ? { color: theme.colors.onPrimary, fontWeight: '700' } : { color: theme.colors.onSurface }}
                selectedColor={isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
              >
                {item.label}
              </Chip>
            );
          })}
        </View>
        <HelperText type="error" visible={!!fieldErrors.activityType}>{fieldErrors.activityType}</HelperText>

        <TouchableOpacity onPress={() => setShowPicker('start')} activeOpacity={0.7}>
          <TextInput
            label="Start Date"
            mode="outlined"
            value={startDate}
            editable={false}
            pointerEvents="none"
            style={styles.input}
            right={<TextInput.Icon icon="calendar" />}
            error={!!fieldErrors.startDate}
          />
        </TouchableOpacity>
        <HelperText type="error" visible={!!fieldErrors.startDate}>{fieldErrors.startDate}</HelperText>

        <TouchableOpacity onPress={() => setShowPicker('end')} activeOpacity={0.7}>
          <TextInput
            label="End Date"
            mode="outlined"
            value={endDate}
            editable={false}
            pointerEvents="none"
            style={styles.input}
            right={<TextInput.Icon icon="calendar" />}
            error={!!fieldErrors.endDate}
          />
        </TouchableOpacity>
        <HelperText type="error" visible={!!fieldErrors.endDate}>{fieldErrors.endDate}</HelperText>

        {showPicker && (
          <DateTimePicker
            value={new Date((showPicker === 'start' ? startDate : endDate) || Date.now())}
            mode="date"
            display="default"
            onChange={onDateChange(showPicker)}
          />
        )}

        <TextInput
          label="Description"
          mode="outlined"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <HelperText type="error" visible={!!error.mutation}>{error.mutation}</HelperText>

        <Button mode="contained" onPress={handleSave} loading={loading.mutation} disabled={loading.mutation} style={styles.saveButton} contentStyle={{ paddingVertical: 6 }}>
          {isEditing ? 'Save Changes' : 'Create Trip'}
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.lg, paddingBottom: spacing.xl },
  coverImage: { width: '100%', height: 160, borderRadius: 16 },
  coverOverlay: { position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  coverOverlayText: { color: '#fff', marginLeft: 4, fontSize: 12 },
  input: { marginTop: spacing.md },
  locationRow: { flexDirection: 'row', marginTop: spacing.md },
  locationButton: { flex: 1, marginRight: spacing.sm, borderRadius: 12 },
  label: { marginTop: spacing.lg, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { marginRight: spacing.sm, marginBottom: spacing.sm },
  coordsText: { marginTop: 4 },
  saveButton: { marginTop: spacing.lg, borderRadius: 12 },
});
