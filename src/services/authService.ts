import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCollection, setCollection, generateId } from '../mock/mockDatabase';
import { networkDelay, MockApiError } from '../mock/mockApiClient';
import { hashPassword } from '../mock/mockHash';
import type { PublicUser, UserProfile, UserRecord } from '../types';

// Mock authentication service (coursework option: "mock server for API
// calls, for prototyping purposes"). No real network requests or servers
// are involved - everything is persisted locally via AsyncStorage.
const SESSION_KEY = '@adventure_trip_planner/session_v1';

function toPublicUser(userRecord: UserRecord): PublicUser {
  return {
    uid: userRecord.uid,
    email: userRecord.email,
    displayName: userRecord.name,
  };
}

function toProfile(userRecord: UserRecord): UserProfile {
  return {
    uid: userRecord.uid,
    name: userRecord.name,
    email: userRecord.email,
    authProvider: userRecord.authProvider,
    createdAt: userRecord.createdAt,
    photoUrl: userRecord.photoUrl ?? null,
  };
}

async function persistSession(uid: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ uid }));
}

export async function registerWithEmail(name: string, email: string, password: string): Promise<PublicUser> {
  await networkDelay();
  const users = await getCollection('users');
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    throw new MockApiError('An account already exists with that email.', 'auth/email-already-in-use');
  }
  if (password.length < 6) {
    throw new MockApiError('Password should be at least 6 characters.', 'auth/weak-password');
  }

  const userRecord: UserRecord = {
    uid: generateId('user'),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    authProvider: 'password',
    createdAt: new Date().toISOString(),
    photoUrl: null,
  };

  await setCollection('users', [...users, userRecord]);
  await persistSession(userRecord.uid);
  return toPublicUser(userRecord);
}

export async function loginWithEmail(email: string, password: string): Promise<PublicUser> {
  await networkDelay();
  const users = await getCollection('users');
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = users.find((u) => u.email === normalizedEmail);

  if (!userRecord) {
    throw new MockApiError('No account found for that email.', 'auth/user-not-found');
  }
  if (userRecord.passwordHash !== hashPassword(password)) {
    throw new MockApiError('Incorrect password. Please try again.', 'auth/wrong-password');
  }

  await persistSession(userRecord.uid);
  return toPublicUser(userRecord);
}

export async function logout(): Promise<void> {
  await networkDelay(200);
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function resetPassword(email: string): Promise<void> {
  await networkDelay();
  const users = await getCollection('users');
  const normalizedEmail = email.trim().toLowerCase();
  const exists = users.some((u) => u.email === normalizedEmail);
  if (!exists) {
    throw new MockApiError('No account found for that email.', 'auth/user-not-found');
  }
  // Mock only: a real backend would email a reset link here. The UI simply
  // confirms the account exists and shows a "check your inbox" message.
}

export interface RestoredSession {
  user: PublicUser;
  profile: UserProfile;
}

// Restores the signed-in user on cold start, mirroring Firebase's
// onAuthStateChanged session restoration but read once from AsyncStorage.
export async function restoreSession(): Promise<RestoredSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  const { uid } = JSON.parse(raw) as { uid: string };
  const users = await getCollection('users');
  const userRecord = users.find((u) => u.uid === uid);
  if (!userRecord) return null;

  return { user: toPublicUser(userRecord), profile: toProfile(userRecord) };
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const users = await getCollection('users');
  const userRecord = users.find((u) => u.uid === uid);
  return userRecord ? toProfile(userRecord) : null;
}

export function mapAuthError(error: unknown): string {
  if (error instanceof MockApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
