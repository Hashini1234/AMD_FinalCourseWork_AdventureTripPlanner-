import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword } from './mockHash';
import type { MockDatabaseShape, CollectionName } from '../types';

const STORAGE_KEY = '@adventure_trip_planner/mock_db_v1';

// In-memory cache so repeated reads within one app session don't round-trip
// through AsyncStorage every time - it is re-hydrated from AsyncStorage once
// per cold start and kept in sync on every write.
let cache: MockDatabaseShape | null = null;

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildSeedDatabase(): MockDatabaseShape {
  const demoUid = 'user_demo';
  const demoTripId = 'trip_demo_ella';
  const now = new Date().toISOString();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 5);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 3);
  const toIso = (d: Date) => d.toISOString().slice(0, 10);

  return {
    users: [
      {
        uid: demoUid,
        name: 'Demo Explorer',
        email: 'demo@adventure.com',
        passwordHash: hashPassword('password123'),
        authProvider: 'password',
        createdAt: now,
        photoUrl: null,
      },
    ],
    trips: [
      {
        tripId: demoTripId,
        ownerId: demoUid,
        title: 'Ella Rock Sunrise Hike',
        destination: 'Ella',
        country: 'Sri Lanka',
        activityType: 'Hiking',
        description: 'A scenic sunrise hike up Ella Rock with the group, followed by breakfast at a local cafe.',
        startDate: toIso(startDate),
        endDate: toIso(endDate),
        latitude: 6.8667,
        longitude: 81.0466,
        coverImage: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
    equipment: [
      { itemId: 'equip_demo_1', tripId: demoTripId, name: 'Tent', isPacked: false, assignedTo: 'Devindi' },
      { itemId: 'equip_demo_2', tripId: demoTripId, name: 'First Aid Kit', isPacked: true, assignedTo: 'Demo Explorer' },
      { itemId: 'equip_demo_3', tripId: demoTripId, name: 'Torch', isPacked: false, assignedTo: '' },
    ],
    expenses: [
      { expenseId: 'expense_demo_1', tripId: demoTripId, category: 'Transport', description: 'Train tickets to Ella', amount: 4500, paidBy: 'Demo Explorer', date: toIso(new Date()), createdAt: now },
      { expenseId: 'expense_demo_2', tripId: demoTripId, category: 'Food', description: 'Groceries for the trip', amount: 3200, paidBy: 'Devindi', date: toIso(new Date()), createdAt: now },
    ],
    photos: [],
  };
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

async function readDb(): Promise<MockDatabaseShape> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    cache = JSON.parse(raw) as MockDatabaseShape;
  } else {
    cache = buildSeedDatabase();
    await persist();
  }
  return cache;
}

export async function getCollection<K extends CollectionName>(name: K): Promise<MockDatabaseShape[K]> {
  const db = await readDb();
  return db[name];
}

export async function setCollection<K extends CollectionName>(
  name: K,
  items: MockDatabaseShape[K]
): Promise<void> {
  const db = await readDb();
  db[name] = items;
  await persist();
}

// Wipes all mock data (trips, equipment, expenses, photos, users) and
// restores the original demo seed. Does not clear the active session key.
export async function resetMockDatabase(): Promise<MockDatabaseShape> {
  cache = buildSeedDatabase();
  await persist();
  return cache;
}
