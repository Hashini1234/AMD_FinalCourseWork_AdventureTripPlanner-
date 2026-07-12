import { getCollection, setCollection, generateId } from '../mock/mockDatabase';
import { networkDelay } from '../mock/mockApiClient';
import type { EquipmentInput, EquipmentItem } from '../types';

export async function fetchEquipment(tripId: string): Promise<EquipmentItem[]> {
  await networkDelay(300);
  const equipment = await getCollection('equipment');
  return equipment.filter((item) => item.tripId === tripId);
}

export async function addEquipmentItem(
  tripId: string,
  { name, assignedTo = '' }: EquipmentInput
): Promise<string> {
  await networkDelay();
  const equipment = await getCollection('equipment');
  const itemId = generateId('equip');
  const newItem: EquipmentItem = { itemId, tripId, name, isPacked: false, assignedTo };
  await setCollection('equipment', [...equipment, newItem]);
  return itemId;
}

export async function updateEquipmentItem(
  tripId: string,
  itemId: string,
  updates: Partial<Omit<EquipmentItem, 'itemId' | 'tripId'>>
): Promise<void> {
  await networkDelay();
  const equipment = await getCollection('equipment');
  await setCollection(
    'equipment',
    equipment.map((item) => (item.itemId === itemId ? { ...item, ...updates } : item))
  );
}

export async function toggleEquipmentPacked(tripId: string, itemId: string, isPacked: boolean): Promise<void> {
  return updateEquipmentItem(tripId, itemId, { isPacked });
}

export async function deleteEquipmentItem(tripId: string, itemId: string): Promise<void> {
  await networkDelay();
  const equipment = await getCollection('equipment');
  await setCollection('equipment', equipment.filter((item) => item.itemId !== itemId));
}
