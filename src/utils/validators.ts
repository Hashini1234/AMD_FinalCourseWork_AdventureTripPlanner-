export function isValidEmail(email: string | undefined | null): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim());
}

export function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export type AuthFormMode = 'login' | 'register' | 'forgot';

export interface AuthFormInput {
  email: string;
  password?: string;
  name?: string;
  mode: AuthFormMode;
}

export type AuthFormErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export function validateAuthForm({ email, password, name, mode }: AuthFormInput): AuthFormErrors {
  const errors: AuthFormErrors = {};
  if (mode === 'register' && !isNonEmpty(name)) {
    errors.name = 'Name is required.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (mode !== 'forgot' && (!password || password.length < 6)) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

export interface TripFormInput {
  title: string;
  destination: string;
  activityType: string;
  startDate: string;
  endDate: string;
}

export type TripFormErrors = Partial<Record<keyof TripFormInput, string>>;

export function validateTripForm({ title, destination, activityType, startDate, endDate }: TripFormInput): TripFormErrors {
  const errors: TripFormErrors = {};
  if (!isNonEmpty(title)) errors.title = 'Trip title is required.';
  if (!isNonEmpty(destination)) errors.destination = 'Destination is required.';
  if (!isNonEmpty(activityType)) errors.activityType = 'Select an activity type.';
  if (!isNonEmpty(startDate)) errors.startDate = 'Start date is required.';
  if (!isNonEmpty(endDate)) errors.endDate = 'End date is required.';
  if (startDate && endDate && startDate > endDate) {
    errors.endDate = 'End date must be after the start date.';
  }
  return errors;
}
