import type { Trip } from '../types';

export function formatDate(isoDate: string | undefined | null): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function isUpcoming(trip: Pick<Trip, 'startDate'>): boolean {
  if (!trip.startDate) return false;
  return new Date(trip.startDate).getTime() >= new Date().setHours(0, 0, 0, 0);
}

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
