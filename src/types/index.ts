// Shared domain types for the mock backend and service layer.
// Screens/components stay in plain JavaScript, but every service, context,
// and the mock database itself are written in TypeScript against these
// shapes - this is the project's "JS + TS" split.

export type AuthProviderName = 'password';

/** Full record as stored in the mock "users" collection (includes the password hash). */
export interface UserRecord {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  authProvider: AuthProviderName;
  createdAt: string;
  photoUrl?: string | null;
}

/** Minimal "session" user, mirroring what a real auth SDK's user object looks like. */
export interface PublicUser {
  uid: string;
  email: string;
  displayName: string;
}

/** Public profile info safe to expose to the UI (no password hash). */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  authProvider: AuthProviderName;
  createdAt: string;
  photoUrl: string | null;
}

export type ActivityType =
  | 'Hiking'
  | 'Camping'
  | 'Cycling'
  | 'Road Trip'
  | 'Mountain Adventure'
  | 'Beach Adventure';

export interface Trip {
  tripId: string;
  ownerId: string;
  title: string;
  destination: string;
  country: string;
  activityType: ActivityType | string;
  description: string;
  startDate: string;
  endDate: string;
  latitude: number | null;
  longitude: number | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields the UI collects when creating/editing a trip (server-assigned fields excluded). */
export type TripInput = Omit<Trip, 'tripId' | 'ownerId' | 'createdAt' | 'updatedAt'>;

export interface EquipmentItem {
  itemId: string;
  tripId: string;
  name: string;
  isPacked: boolean;
  assignedTo: string;
}

export type EquipmentInput = Pick<EquipmentItem, 'name' | 'assignedTo'>;

export interface Expense {
  expenseId: string;
  tripId: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  createdAt: string;
}

export type ExpenseInput = Omit<Expense, 'expenseId' | 'tripId' | 'createdAt' | 'amount'> & {
  amount: number | string;
};

export interface Photo {
  photoId: string;
  tripId: string;
  imageUrl: string;
  uploadedBy: string;
  caption: string;
  uploadedAt: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  country?: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResult {
  city: string;
  country: string;
}

export interface NotificationPreferences {
  tripReminders: boolean;
  packingReminders: boolean;
}

export interface ExpenseBalance {
  payer: string;
  paidAmount: number;
  balance: number;
}

export interface ExpenseSplitSummary {
  total: number;
  perPerson: number;
  balances: ExpenseBalance[];
}

/** The whole mock "database" persisted to AsyncStorage as one JSON blob. */
export interface MockDatabaseShape {
  users: UserRecord[];
  trips: Trip[];
  equipment: EquipmentItem[];
  expenses: Expense[];
  photos: Photo[];
}

export type CollectionName = keyof MockDatabaseShape;
