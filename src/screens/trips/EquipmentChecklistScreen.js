import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Checkbox, IconButton, ProgressBar, Text, TextInput, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import EmptyState from '../../components/EmptyState';
import { scheduleChecklistReminder } from '../../services/notificationService';
import { spacing } from '../../theme/theme';

export default function EquipmentChecklistScreen({ route }) {
  const theme = useTheme();
  const { tripId } = route.params;
  const { trips, equipment, fetchTripDetail, addEquipmentItem, toggleEquipmentPacked, removeEquipmentItem } = useTrips();
  const trip = trips.find((t) => t.tripId === tripId);
  const [newItem, setNewItem] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchTripDetail(tripId);
    }, [tripId])
  );

  const packedCount = equipment.filter((item) => item.isPacked).length;
  const progress = equipment.length ? packedCount / equipment.length : 0;

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addEquipmentItem(tripId, { name: newItem.trim(), assignedTo: assignedTo.trim() });
    setNewItem('');
    setAssignedTo('');
  };

  const handleRemind = () => {
    if (trip) scheduleChecklistReminder(trip, equipment.length - packedCount);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="titleMedium">{packedCount} of {equipment.length} packed</Text>
        <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progress} />
      </View>

      <View style={styles.addRow}>
        <TextInput
          mode="outlined"
          placeholder="Add equipment item"
          value={newItem}
          onChangeText={setNewItem}
          style={styles.itemInput}
          onSubmitEditing={handleAdd}
        />
        <IconButton icon="plus-circle" size={32} onPress={handleAdd} />
      </View>
      <TextInput
        mode="outlined"
        placeholder="Assigned to (optional)"
        value={assignedTo}
        onChangeText={setAssignedTo}
        style={styles.assignInput}
      />

      <FlatList
        data={equipment}
        keyExtractor={(item) => item.itemId}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={<EmptyState icon="bag-personal-outline" title="No equipment yet" message="Add tents, first aid kits, torches and more." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Checkbox
              status={item.isPacked ? 'checked' : 'unchecked'}
              onPress={() => toggleEquipmentPacked(tripId, item.itemId, !item.isPacked)}
            />
            <View style={{ flex: 1 }}>
              <Text style={item.isPacked ? styles.packedText : undefined}>{item.name}</Text>
              {!!item.assignedTo && <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Assigned to {item.assignedTo}</Text>}
            </View>
            <IconButton icon="trash-can-outline" onPress={() => removeEquipmentItem(tripId, item.itemId)} />
          </View>
        )}
      />

      {equipment.length - packedCount > 0 && (
        <IconButton icon="bell-outline" mode="contained" style={styles.remindFab} onPress={handleRemind} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md },
  progress: { marginTop: spacing.sm, height: 8, borderRadius: 4 },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md },
  itemInput: { flex: 1 },
  assignInput: { marginHorizontal: spacing.md, marginTop: spacing.xs, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
  packedText: { textDecorationLine: 'line-through', opacity: 0.5 },
  remindFab: { position: 'absolute', right: spacing.md, bottom: spacing.md },
});
