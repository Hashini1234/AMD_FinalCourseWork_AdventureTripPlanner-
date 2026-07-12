import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, Menu, Text, TextInput, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import ScreenContainer from '../../components/ScreenContainer';
import EmptyState from '../../components/EmptyState';
import { calculateSplit } from '../../services/expenseService';
import { spacing } from '../../theme/theme';

const CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Gear', 'Activities', 'Other'];

export default function ExpenseSplitterScreen({ route }) {
  const theme = useTheme();
  const { tripId } = route.params;
  const { user } = useAuth();
  const { expenses, fetchTripDetail, addExpenseItem, removeExpenseItem, loading } = useTrips();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [memberCount, setMemberCount] = useState('1');

  useFocusEffect(
    useCallback(() => {
      fetchTripDetail(tripId);
    }, [tripId])
  );

  const split = useMemo(() => calculateSplit(expenses, Number(memberCount) || 1), [expenses, memberCount]);

  const handleAdd = async () => {
    if (!description.trim() || !amount) return;
    await addExpenseItem(tripId, {
      description: description.trim(),
      amount,
      category,
      paidBy: user?.displayName || user?.email || 'You',
      date: new Date().toISOString().slice(0, 10),
    });
    setDescription('');
    setAmount('');
  };

  return (
    <ScreenContainer>
      <Card style={styles.summaryCard} mode="contained">
        <Card.Content>
          <Text variant="titleMedium">Total: Rs. {split.total.toLocaleString()}</Text>
          <View style={styles.memberRow}>
            <Text style={{ marginRight: spacing.sm }}>Members</Text>
            <TextInput
              mode="outlined"
              value={memberCount}
              onChangeText={(v) => setMemberCount(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              dense
              style={styles.memberInput}
            />
            <Text style={{ marginLeft: spacing.md }}>Each pays: Rs. {split.perPerson.toLocaleString()}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.addRow}>
        <TextInput mode="outlined" placeholder="Description" value={description} onChangeText={setDescription} style={styles.descInput} />
        <TextInput mode="outlined" placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={styles.amountInput} />
      </View>
      <View style={styles.addRow}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<Chip icon="tag-outline" onPress={() => setMenuVisible(true)}>{category}</Chip>}
        >
          {CATEGORIES.map((c) => (
            <Menu.Item key={c} title={c} onPress={() => { setCategory(c); setMenuVisible(false); }} />
          ))}
        </Menu>
        <Button mode="contained" onPress={handleAdd} loading={loading.mutation} style={styles.addButton}>Add Expense</Button>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.expenseId}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={<EmptyState icon="cash-multiple" title="No expenses yet" message="Add shared costs like food, transport, or gear." />}
        renderItem={({ item }) => (
          <View style={styles.expenseRow}>
            <View style={{ flex: 1 }}>
              <Text>{item.description}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.category} • Paid by {item.paidBy}</Text>
            </View>
            <Text variant="titleSmall">Rs. {Number(item.amount).toLocaleString()}</Text>
            <IconButton icon="trash-can-outline" size={20} onPress={() => removeExpenseItem(tripId, item.expenseId)} />
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: { margin: spacing.md, borderRadius: 16 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  memberInput: { width: 56, height: 40 },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  descInput: { flex: 1, marginRight: spacing.sm },
  amountInput: { width: 100 },
  addButton: { marginLeft: 'auto', borderRadius: 10 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
