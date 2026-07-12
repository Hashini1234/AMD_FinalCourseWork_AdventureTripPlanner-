import * as FileSystem from 'expo-file-system/legacy';
import { getCollection, setCollection, generateId } from '../mock/mockDatabase';
import { networkDelay } from '../mock/mockApiClient';
import type { Photo } from '../types';

const PHOTOS_DIR = `${FileSystem.documentDirectory}trip-photos/`;

async function ensurePhotosDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

// Copies the picked/captured image into the app's persistent document
// directory (instead of uploading to Firebase Storage) so it survives after
// Expo's temporary image cache is cleared.
async function persistLocalCopy(localUri: string): Promise<string> {
  await ensurePhotosDir();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const destination = `${PHOTOS_DIR}${filename}`;
  await FileSystem.copyAsync({ from: localUri, to: destination });
  return destination;
}

export async function fetchPhotos(tripId: string): Promise<Photo[]> {
  await networkDelay(300);
  const photos = await getCollection('photos');
  return photos.filter((photo) => photo.tripId === tripId);
}

export async function addPhoto(
  tripId: string,
  uploadedBy: string,
  localUri: string,
  caption = ''
): Promise<{ photoId: string; imageUrl: string }> {
  await networkDelay();
  const imageUrl = await persistLocalCopy(localUri);
  const photos = await getCollection('photos');
  const photoId = generateId('photo');
  const newPhoto: Photo = {
    photoId,
    tripId,
    imageUrl,
    uploadedBy,
    caption,
    uploadedAt: new Date().toISOString(),
  };
  await setCollection('photos', [...photos, newPhoto]);
  return { photoId, imageUrl };
}

export async function deletePhoto(tripId: string, photoId: string, storagePath?: string): Promise<void> {
  await networkDelay();
  const photos = await getCollection('photos');
  const target = photos.find((photo) => photo.photoId === photoId);
  const fileUri = storagePath || target?.imageUrl;

  if (fileUri) {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.warn('Could not delete local photo file:', error instanceof Error ? error.message : error);
    }
  }

  await setCollection('photos', photos.filter((photo) => photo.photoId !== photoId));
}
