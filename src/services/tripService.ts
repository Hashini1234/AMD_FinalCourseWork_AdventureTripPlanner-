import { getCollection, setCollection, generateId } from '../mock/mockDatabase';
import { networkDelay } from '../mock/mockApiClient';
import type { Trip, TripInput } from '../types';

export async function createTrip(ownerId: string, tripData: TripInput): Promise<string> {
  await networkDelay();
  const trips = await getCollection('trips');
  const tripId = generateId('trip');
  const now = new Date().toISOString();

  const newTrip: Trip = {
    tripId,
    ownerId,
    title: tripData.title,
    destination: tripData.destination,
    country: tripData.country || '',
    activityType: tripData.activityType,
    description: tripData.description || '',
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    latitude: tripData.latitude ?? null,
    longitude: tripData.longitude ?? null,
    coverImage: tripData.coverImage || null,
    createdAt: now,
    updatedAt: now,
  };

  await setCollection('trips', [...trips, newTrip]);
  return tripId;
}

export async function updateTrip(tripId: string, tripData: Partial<TripInput>): Promise<void> {
  await networkDelay();
  const trips = await getCollection('trips');
  const updated = trips.map((trip) =>
    trip.tripId === tripId ? { ...trip, ...tripData, updatedAt: new Date().toISOString() } : trip
  );
  await setCollection('trips', updated);
}

// Cascades the delete to equipment/expenses/photos since the mock database
// uses flat collections with a tripId foreign key instead of Firestore-style
// sub-collections.
export async function deleteTrip(tripId: string): Promise<void> {
  await networkDelay();
  const [trips, equipment, expenses, photos] = await Promise.all([
    getCollection('trips'),
    getCollection('equipment'),
    getCollection('expenses'),
    getCollection('photos'),
  ]);

  await Promise.all([
    setCollection('trips', trips.filter((t) => t.tripId !== tripId)),
    setCollection('equipment', equipment.filter((e) => e.tripId !== tripId)),
    setCollection('expenses', expenses.filter((e) => e.tripId !== tripId)),
    setCollection('photos', photos.filter((p) => p.tripId !== tripId)),
  ]);
}

export async function fetchTripsForUser(ownerId: string): Promise<Trip[]> {
  await networkDelay();
  const trips = await getCollection('trips');
  return trips
    .filter((trip) => trip.ownerId === ownerId)
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
}
