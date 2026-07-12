import React, { createContext, useCallback, useContext, useMemo, useReducer, ReactNode } from 'react';
import * as tripService from '../services/tripService';
import * as equipmentService from '../services/equipmentService';
import * as expenseService from '../services/expenseService';
import * as photoService from '../services/photoService';
import { fetchWeatherByDestination, fetchWeatherByCoords } from '../services/weatherService';
import type { EquipmentInput, EquipmentItem, Expense, ExpenseInput, Photo, Trip, TripInput, WeatherData } from '../types';

type MutationResult = { success: true } | { success: false; error: string };
type CreateTripResult = { success: true; tripId: string } | { success: false; error: string };

interface LoadingState {
  trips: boolean;
  tripDetail: boolean;
  weather: boolean;
  mutation: boolean;
}

interface ErrorState {
  trips: string | null;
  tripDetail: string | null;
  weather: string | null;
  mutation: string | null;
}

interface TripState {
  trips: Trip[];
  selectedTrip: Trip | null;
  equipment: EquipmentItem[];
  expenses: Expense[];
  photos: Photo[];
  weather: WeatherData | null;
  loading: LoadingState;
  error: ErrorState;
}

type TripAction =
  | { type: 'FETCH_TRIPS_START' }
  | { type: 'FETCH_TRIPS_SUCCESS'; payload: Trip[] }
  | { type: 'FETCH_TRIPS_ERROR'; payload: string }
  | { type: 'SELECT_TRIP'; payload: Trip }
  | { type: 'FETCH_TRIP_DETAIL_START' }
  | { type: 'FETCH_TRIP_DETAIL_SUCCESS'; payload: { equipment: EquipmentItem[]; expenses: Expense[]; photos: Photo[] } }
  | { type: 'FETCH_TRIP_DETAIL_ERROR'; payload: string }
  | { type: 'ADD_TRIP_SUCCESS'; payload: Trip }
  | { type: 'UPDATE_TRIP_SUCCESS'; payload: Trip }
  | { type: 'DELETE_TRIP_SUCCESS'; payload: string }
  | { type: 'SET_EQUIPMENT'; payload: EquipmentItem[] }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'SET_PHOTOS'; payload: Photo[] }
  | { type: 'FETCH_WEATHER_START' }
  | { type: 'FETCH_WEATHER_SUCCESS'; payload: WeatherData }
  | { type: 'FETCH_WEATHER_ERROR'; payload: string }
  | { type: 'MUTATION_START' }
  | { type: 'MUTATION_END' }
  | { type: 'MUTATION_ERROR'; payload: string };

interface TripContextValue extends TripState {
  fetchTrips: (ownerId: string) => Promise<void>;
  selectTrip: (trip: Trip) => void;
  fetchTripDetail: (tripId: string) => Promise<void>;
  createTrip: (ownerId: string, tripData: TripInput) => Promise<CreateTripResult>;
  editTrip: (tripId: string, tripData: Partial<TripInput>) => Promise<MutationResult>;
  removeTrip: (tripId: string) => Promise<MutationResult>;
  addEquipmentItem: (tripId: string, item: EquipmentInput) => Promise<string>;
  toggleEquipmentPacked: (tripId: string, itemId: string, isPacked: boolean) => Promise<void>;
  removeEquipmentItem: (tripId: string, itemId: string) => Promise<void>;
  addExpenseItem: (tripId: string, expense: ExpenseInput) => Promise<void>;
  removeExpenseItem: (tripId: string, expenseId: string) => Promise<void>;
  uploadTripPhoto: (tripId: string, uploadedBy: string, localUri: string, caption?: string) => Promise<void>;
  removeTripPhoto: (tripId: string, photoId: string, storagePath?: string) => Promise<void>;
  loadWeatherForDestination: (destination: string) => Promise<WeatherData | null>;
  loadWeatherForCoords: (latitude: number, longitude: number) => Promise<WeatherData | null>;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

const initialState: TripState = {
  trips: [],
  selectedTrip: null,
  equipment: [],
  expenses: [],
  photos: [],
  weather: null,
  loading: { trips: false, tripDetail: false, weather: false, mutation: false },
  error: { trips: null, tripDetail: null, weather: null, mutation: null },
};

function setLoading(state: TripState, key: keyof LoadingState, value: boolean): TripState {
  return { ...state, loading: { ...state.loading, [key]: value } };
}

function setError(state: TripState, key: keyof ErrorState, value: string | null): TripState {
  return { ...state, error: { ...state.error, [key]: value } };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'FETCH_TRIPS_START':
      return setError(setLoading(state, 'trips', true), 'trips', null);
    case 'FETCH_TRIPS_SUCCESS':
      return setLoading({ ...state, trips: action.payload }, 'trips', false);
    case 'FETCH_TRIPS_ERROR':
      return setLoading(setError(state, 'trips', action.payload), 'trips', false);

    case 'SELECT_TRIP':
      return { ...state, selectedTrip: action.payload, equipment: [], expenses: [], photos: [], weather: null };

    case 'FETCH_TRIP_DETAIL_START':
      return setError(setLoading(state, 'tripDetail', true), 'tripDetail', null);
    case 'FETCH_TRIP_DETAIL_SUCCESS':
      return setLoading(
        { ...state, equipment: action.payload.equipment, expenses: action.payload.expenses, photos: action.payload.photos },
        'tripDetail',
        false
      );
    case 'FETCH_TRIP_DETAIL_ERROR':
      return setLoading(setError(state, 'tripDetail', action.payload), 'tripDetail', false);

    case 'ADD_TRIP_SUCCESS':
      return { ...state, trips: [...state.trips, action.payload] };
    case 'UPDATE_TRIP_SUCCESS':
      return {
        ...state,
        trips: state.trips.map((trip) => (trip.tripId === action.payload.tripId ? action.payload : trip)),
        selectedTrip: state.selectedTrip?.tripId === action.payload.tripId ? action.payload : state.selectedTrip,
      };
    case 'DELETE_TRIP_SUCCESS':
      return { ...state, trips: state.trips.filter((trip) => trip.tripId !== action.payload) };

    case 'SET_EQUIPMENT':
      return { ...state, equipment: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_PHOTOS':
      return { ...state, photos: action.payload };

    case 'FETCH_WEATHER_START':
      return setError(setLoading(state, 'weather', true), 'weather', null);
    case 'FETCH_WEATHER_SUCCESS':
      return setLoading({ ...state, weather: action.payload }, 'weather', false);
    case 'FETCH_WEATHER_ERROR':
      return setLoading(setError(state, 'weather', action.payload), 'weather', false);

    case 'MUTATION_START':
      return setError(setLoading(state, 'mutation', true), 'mutation', null);
    case 'MUTATION_END':
      return setLoading(state, 'mutation', false);
    case 'MUTATION_ERROR':
      return setLoading(setError(state, 'mutation', action.payload), 'mutation', false);

    default:
      return state;
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  const fetchTrips = useCallback(async (ownerId: string) => {
    dispatch({ type: 'FETCH_TRIPS_START' });
    try {
      const trips = await tripService.fetchTripsForUser(ownerId);
      dispatch({ type: 'FETCH_TRIPS_SUCCESS', payload: trips });
    } catch (error) {
      dispatch({ type: 'FETCH_TRIPS_ERROR', payload: errorMessage(error) });
    }
  }, []);

  const selectTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'SELECT_TRIP', payload: trip });
  }, []);

  const fetchTripDetail = useCallback(async (tripId: string) => {
    dispatch({ type: 'FETCH_TRIP_DETAIL_START' });
    try {
      const [equipment, expenses, photos] = await Promise.all([
        equipmentService.fetchEquipment(tripId),
        expenseService.fetchExpenses(tripId),
        photoService.fetchPhotos(tripId),
      ]);
      dispatch({ type: 'FETCH_TRIP_DETAIL_SUCCESS', payload: { equipment, expenses, photos } });
    } catch (error) {
      dispatch({ type: 'FETCH_TRIP_DETAIL_ERROR', payload: errorMessage(error) });
    }
  }, []);

  const createTrip = useCallback(async (ownerId: string, tripData: TripInput): Promise<CreateTripResult> => {
    dispatch({ type: 'MUTATION_START' });
    try {
      const tripId = await tripService.createTrip(ownerId, tripData);
      const now = new Date().toISOString();
      const newTrip: Trip = { tripId, ownerId, createdAt: now, updatedAt: now, ...tripData };
      dispatch({ type: 'ADD_TRIP_SUCCESS', payload: newTrip });
      dispatch({ type: 'MUTATION_END' });
      return { success: true, tripId };
    } catch (error) {
      const message = errorMessage(error);
      dispatch({ type: 'MUTATION_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const editTrip = useCallback(async (tripId: string, tripData: Partial<TripInput>): Promise<MutationResult> => {
    dispatch({ type: 'MUTATION_START' });
    try {
      await tripService.updateTrip(tripId, tripData);
      const existing = state.trips.find((trip) => trip.tripId === tripId);
      if (existing) {
        dispatch({ type: 'UPDATE_TRIP_SUCCESS', payload: { ...existing, ...tripData, updatedAt: new Date().toISOString() } });
      }
      dispatch({ type: 'MUTATION_END' });
      return { success: true };
    } catch (error) {
      const message = errorMessage(error);
      dispatch({ type: 'MUTATION_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, [state.trips]);

  const removeTrip = useCallback(async (tripId: string): Promise<MutationResult> => {
    dispatch({ type: 'MUTATION_START' });
    try {
      await tripService.deleteTrip(tripId);
      dispatch({ type: 'DELETE_TRIP_SUCCESS', payload: tripId });
      dispatch({ type: 'MUTATION_END' });
      return { success: true };
    } catch (error) {
      const message = errorMessage(error);
      dispatch({ type: 'MUTATION_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  // ---- Equipment ----
  const addEquipmentItem = useCallback(async (tripId: string, item: EquipmentInput) => {
    const itemId = await equipmentService.addEquipmentItem(tripId, item);
    const updated = await equipmentService.fetchEquipment(tripId);
    dispatch({ type: 'SET_EQUIPMENT', payload: updated });
    return itemId;
  }, []);

  const toggleEquipmentPacked = useCallback(async (tripId: string, itemId: string, isPacked: boolean) => {
    await equipmentService.toggleEquipmentPacked(tripId, itemId, isPacked);
    dispatch({
      type: 'SET_EQUIPMENT',
      payload: state.equipment.map((item) => (item.itemId === itemId ? { ...item, isPacked } : item)),
    });
  }, [state.equipment]);

  const removeEquipmentItem = useCallback(async (tripId: string, itemId: string) => {
    await equipmentService.deleteEquipmentItem(tripId, itemId);
    dispatch({ type: 'SET_EQUIPMENT', payload: state.equipment.filter((item) => item.itemId !== itemId) });
  }, [state.equipment]);

  // ---- Expenses ----
  const addExpenseItem = useCallback(async (tripId: string, expense: ExpenseInput) => {
    await expenseService.addExpense(tripId, expense);
    const updated = await expenseService.fetchExpenses(tripId);
    dispatch({ type: 'SET_EXPENSES', payload: updated });
  }, []);

  const removeExpenseItem = useCallback(async (tripId: string, expenseId: string) => {
    await expenseService.deleteExpense(tripId, expenseId);
    dispatch({ type: 'SET_EXPENSES', payload: state.expenses.filter((e) => e.expenseId !== expenseId) });
  }, [state.expenses]);

  // ---- Photos ----
  const uploadTripPhoto = useCallback(async (tripId: string, uploadedBy: string, localUri: string, caption?: string) => {
    await photoService.addPhoto(tripId, uploadedBy, localUri, caption);
    const updated = await photoService.fetchPhotos(tripId);
    dispatch({ type: 'SET_PHOTOS', payload: updated });
  }, []);

  const removeTripPhoto = useCallback(async (tripId: string, photoId: string, storagePath?: string) => {
    await photoService.deletePhoto(tripId, photoId, storagePath);
    dispatch({ type: 'SET_PHOTOS', payload: state.photos.filter((p) => p.photoId !== photoId) });
  }, [state.photos]);

  // ---- Weather ----
  const loadWeatherForDestination = useCallback(async (destination: string): Promise<WeatherData | null> => {
    dispatch({ type: 'FETCH_WEATHER_START' });
    try {
      const weather = await fetchWeatherByDestination(destination);
      dispatch({ type: 'FETCH_WEATHER_SUCCESS', payload: weather });
      return weather;
    } catch (error) {
      dispatch({ type: 'FETCH_WEATHER_ERROR', payload: errorMessage(error) });
      return null;
    }
  }, []);

  const loadWeatherForCoords = useCallback(async (latitude: number, longitude: number): Promise<WeatherData | null> => {
    dispatch({ type: 'FETCH_WEATHER_START' });
    try {
      const weather = await fetchWeatherByCoords(latitude, longitude);
      dispatch({ type: 'FETCH_WEATHER_SUCCESS', payload: weather });
      return weather;
    } catch (error) {
      dispatch({ type: 'FETCH_WEATHER_ERROR', payload: errorMessage(error) });
      return null;
    }
  }, []);

  const value = useMemo<TripContextValue>(
    () => ({
      ...state,
      fetchTrips,
      selectTrip,
      fetchTripDetail,
      createTrip,
      editTrip,
      removeTrip,
      addEquipmentItem,
      toggleEquipmentPacked,
      removeEquipmentItem,
      addExpenseItem,
      removeExpenseItem,
      uploadTripPhoto,
      removeTripPhoto,
      loadWeatherForDestination,
      loadWeatherForCoords,
    }),
    [state, fetchTrips, selectTrip, fetchTripDetail, createTrip, editTrip, removeTrip,
      addEquipmentItem, toggleEquipmentPacked, removeEquipmentItem,
      addExpenseItem, removeExpenseItem, uploadTripPhoto, removeTripPhoto,
      loadWeatherForDestination, loadWeatherForCoords]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrips(): TripContextValue {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
}
