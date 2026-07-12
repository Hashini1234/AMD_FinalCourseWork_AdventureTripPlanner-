import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, FAB, Portal, Text, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import EmptyState from '../../components/EmptyState';
import { spacing, radius } from '../../theme/theme';

const PHOTO_SIZE = 110;

export default function GalleryScreen({ route }) {
  const theme = useTheme();
  const { user } = useAuth();
  const { trips, fetchTrips, photos, fetchTripDetail, uploadTripPhoto, removeTripPhoto, loading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState(route.params?.tripId || null);
  const [fabOpen, setFabOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) fetchTrips(user.uid);
    }, [user?.uid])
  );

  useEffect(() => {
    if (!selectedTripId && trips.length) setSelectedTripId(trips[0].tripId);
  }, [trips]);

  useEffect(() => {
    if (selectedTripId) fetchTripDetail(selectedTripId);
  }, [selectedTripId]);

  const pickAndUpload = async (fromCamera) => {
    setFabOpen(false);
    if (!selectedTripId) return;
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to continue.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });

    if (!result.canceled) {
      await uploadTripPhoto(selectedTripId, user.uid, result.assets[0].uri);
    }
  };

  const handleDelete = (photo) => {
    Alert.alert('Delete photo', 'Remove this photo from the gallery?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeTripPhoto(selectedTripId, photo.photoId, photo.storagePath) },
    ]);
  };

  if (!trips.length) {
    return (
      <ScreenContainer>
        <EmptyState icon="image-multiple-outline" title="No trips yet" message="Create a trip first, then add photos to its gallery." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={trips}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.tripId}
        style={styles.tripSelector}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <Chip
            selected={selectedTripId === item.tripId}
            onPress={() => setSelectedTripId(item.tripId)}
            style={styles.tripChip}
          >
            {item.title}
          </Chip>
        )}
      />

      <FlatList
        data={photos}
        keyExtractor={(item) => item.photoId}
        numColumns={3}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={<EmptyState icon="camera-outline" title="No photos yet" message="Capture or upload photos for this trip." />}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleDelete(item)} style={styles.photoWrapper}>
            <Image source={{ uri: item.imageUrl }} style={styles.photo} />
          </TouchableOpacity>
        )}
      />

      <Portal>
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? 'close' : 'camera-plus-outline'}
          actions={[
            { icon: 'camera-outline', label: 'Take Photo', onPress: () => pickAndUpload(true) },
            { icon: 'image-outline', label: 'Choose from Library', onPress: () => pickAndUpload(false) },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          style={styles.fab}
        />
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tripSelector: { marginTop: spacing.md, flexGrow: 0 },
  tripChip: { marginRight: spacing.sm },
  grid: { padding: spacing.sm, paddingBottom: 100 },
  photoWrapper: { margin: 4 },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: radius.sm },
  fab: { position: 'absolute', right: 0, bottom: 0 },
});
