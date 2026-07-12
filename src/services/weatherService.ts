import type { GeoPoint, WeatherData } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

class WeatherApiError extends Error {}

interface GeocodeResult {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

interface OpenWeatherResponse {
  main: { temp: number; feels_like: number; humidity: number };
  weather?: { main: string; description: string; icon: string }[];
  wind?: { speed: number };
  name: string;
}

async function safeFetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new WeatherApiError('Network error while contacting the weather service.');
  }
  if (!response.ok) {
    if (response.status === 404) {
      throw new WeatherApiError('That location could not be found.');
    }
    if (response.status === 401) {
      throw new WeatherApiError('Invalid OpenWeather API key.');
    }
    throw new WeatherApiError(`Weather service error (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export interface DestinationCoords extends GeoPoint {
  name: string;
  country: string;
}

// Resolves a free-text destination name into coordinates using the
// OpenWeather Geocoding API.
export async function geocodeDestination(destination: string): Promise<DestinationCoords> {
  if (!API_KEY) throw new WeatherApiError('Missing OpenWeather API key. Check your .env file.');
  const url = `${GEO_URL}/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${API_KEY}`;
  const results = await safeFetchJson<GeocodeResult[]>(url);
  if (!results.length) throw new WeatherApiError('That location could not be found.');
  const { lat, lon, name, country } = results[0];
  return { latitude: lat, longitude: lon, name, country };
}

export async function fetchWeatherByCoords(latitude: number, longitude: number): Promise<WeatherData> {
  if (!API_KEY) throw new WeatherApiError('Missing OpenWeather API key. Check your .env file.');
  const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
  const data = await safeFetchJson<OpenWeatherResponse>(url);
  return {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    condition: data.weather?.[0]?.main || 'Unknown',
    description: data.weather?.[0]?.description || '',
    icon: data.weather?.[0]?.icon || '01d',
    humidity: data.main.humidity,
    windSpeed: data.wind?.speed ?? 0,
    location: data.name,
  };
}

export async function fetchWeatherByDestination(destination: string): Promise<WeatherData & DestinationCoords> {
  const coords = await geocodeDestination(destination);
  const weather = await fetchWeatherByCoords(coords.latitude, coords.longitude);
  return { ...weather, ...coords };
}

export function weatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export { WeatherApiError };
