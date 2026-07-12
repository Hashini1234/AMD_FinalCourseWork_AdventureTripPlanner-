import * as FileSystem from 'expo-file-system/legacy';
import { getCollection, setCollection } from '../mock/mockDatabase';
import { networkDelay } from '../mock/mockApiClient';
import type { UserProfile, UserRecord } from '../types';

const AVATARS_DIR = `${FileSystem.documentDirectory}profile-photos/`;

async function ensureAvatarsDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(AVATARS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AVATARS_DIR, { intermediates: true });
  }
}

// Each save gets a unique filename (rather than overwriting a fixed path) so
// the new URI is guaranteed to differ from the old one - otherwise <Image>
// may keep showing a cached copy of the previous avatar for the same path.
async function persistAvatar(uid: string, localUri: string, previousPhotoUrl?: string | null): Promise<string> {
  await ensureAvatarsDir();
  const destination = `${AVATARS_DIR}${uid}_${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: localUri, to: destination });

  if (previousPhotoUrl) {
    try {
      await FileSystem.deleteAsync(previousPhotoUrl, { idempotent: true });
    } catch (error) {
      console.warn('Could not delete previous avatar file:', error instanceof Error ? error.message : error);
    }
  }

  return destination;
}

function toProfile(userRecord: UserRecord): UserProfile {
  return {
    uid: userRecord.uid,
    name: userRecord.name,
    email: userRecord.email,
    authProvider: userRecord.authProvider,
    createdAt: userRecord.createdAt,
    photoUrl: userRecord.photoUrl || null,
  };
}

export interface UpdateProfileInput {
  name?: string;
  photoUri?: string;
}

export async function updateUserProfile(uid: string, { name, photoUri }: UpdateProfileInput = {}): Promise<UserProfile> {
  await networkDelay();
  const users = await getCollection('users');
  const existing = users.find((u) => u.uid === uid);

  let photoUrl = existing?.photoUrl;
  if (photoUri) {
    photoUrl = await persistAvatar(uid, photoUri, existing?.photoUrl);
  }

  const updated = users.map((u) =>
    u.uid === uid
      ? { ...u, ...(name !== undefined && name !== '' ? { name } : {}), photoUrl }
      : u
  );
  await setCollection('users', updated);

  const userRecord = updated.find((u) => u.uid === uid);
  if (!userRecord) {
    throw new Error('User not found.');
  }
  return toProfile(userRecord);
}
