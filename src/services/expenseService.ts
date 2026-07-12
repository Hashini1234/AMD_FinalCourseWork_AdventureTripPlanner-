import { getCollection, setCollection, generateId } from '../mock/mockDatabase';
import { networkDelay } from '../mock/mockApiClient';
import type { Expense, ExpenseInput, ExpenseSplitSummary } from '../types';

export async function fetchExpenses(tripId: string): Promise<Expense[]> {
  await networkDelay(300);
  const expenses = await getCollection('expenses');
  return expenses.filter((item) => item.tripId === tripId);
}

export async function addExpense(
  tripId: string,
  { category, description, amount, paidBy, date }: ExpenseInput
): Promise<string> {
  await networkDelay();
  const expenses = await getCollection('expenses');
  const expenseId = generateId('expense');
  const newExpense: Expense = {
    expenseId,
    tripId,
    category,
    description,
    amount: Number(amount),
    paidBy,
    date,
    createdAt: new Date().toISOString(),
  };
  await setCollection('expenses', [...expenses, newExpense]);
  return expenseId;
}

export async function updateExpense(
  tripId: string,
  expenseId: string,
  updates: Partial<Omit<Expense, 'expenseId' | 'tripId' | 'createdAt'>>
): Promise<void> {
  await networkDelay();
  const expenses = await getCollection('expenses');
  await setCollection(
    'expenses',
    expenses.map((item) =>
      item.expenseId === expenseId
        ? { ...item, ...updates, ...(updates.amount !== undefined ? { amount: Number(updates.amount) } : {}) }
        : item
    )
  );
}

export async function deleteExpense(tripId: string, expenseId: string): Promise<void> {
  await networkDelay();
  const expenses = await getCollection('expenses');
  await setCollection('expenses', expenses.filter((item) => item.expenseId !== expenseId));
}

// Splits the total cost evenly across `memberCount` people and reports each
// payer's net balance (positive = owed money, negative = owes money).
export function calculateSplit(expenses: Expense[], memberCount: number): ExpenseSplitSummary {
  const total = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const perPerson = memberCount > 0 ? total / memberCount : 0;

  const paidByTotals = expenses.reduce<Record<string, number>>((acc, expense) => {
    const payer = expense.paidBy || 'Unassigned';
    acc[payer] = (acc[payer] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  const balances = Object.entries(paidByTotals).map(([payer, paidAmount]) => ({
    payer,
    paidAmount,
    balance: Number((paidAmount - perPerson).toFixed(2)),
  }));

  return {
    total: Number(total.toFixed(2)),
    perPerson: Number(perPerson.toFixed(2)),
    balances,
  };
}
