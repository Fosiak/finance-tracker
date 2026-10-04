import { createContext, useContext, useEffect, useState } from "react";

import {
  getTransactions,
  createTransaction,
  updateTransaction as updateTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
} from "../services/transactions";
import { getBudgets, setBudgetForMonth } from "../services/budgets";

const FinanceContext = createContext(null);

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function FinanceProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [transactions, budgetList] = await Promise.all([
          getTransactions(),
          getBudgets(),
        ]);

        if (isCancelled) return;

        setExpenses(transactions);

        setBudgets(
          Object.fromEntries(
            budgetList.map((budget) => [budget.month, budget.limit]),
          ),
        );
      } catch (err) {
        if (!isCancelled) setError(err.message);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function addExpense(expense) {
    const { id: _ignoredClientId, ...payload } = expense;
    const created = await createTransaction(payload);
    setExpenses((current) => [created, ...current]);
  }

  async function deleteExpense(id) {
    await deleteTransactionRequest(id);
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }

  async function updateExpense(updatedExpense) {
    const { id, ...payload } = updatedExpense;
    const saved = await updateTransactionRequest(id, payload);
    setExpenses((current) =>
      current.map((expense) => (expense.id === id ? saved : expense)),
    );
  }

  async function setBudget(month, amount) {
    const saved = await setBudgetForMonth(month, amount);
    setBudgets((current) => ({ ...current, [month]: saved.limit }));
  }

  function getBudgetForMonth(month) {
    return budgets[month] ?? 0;
  }

  const selectedMonthExpenses = expenses.filter((expense) =>
    expense.date.startsWith(selectedMonth),
  );

  const selectedMonthBudget = getBudgetForMonth(selectedMonth);

  return (
    <FinanceContext.Provider
      value={{
        expenses,
        selectedMonth,
        setSelectedMonth,
        selectedMonthExpenses,

        budgets,
        setBudget,
        getBudgetForMonth,
        selectedMonthBudget,

        addExpense,
        deleteExpense,
        updateExpense,

        isLoading,
        error,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

function useFinance() {
  return useContext(FinanceContext);
}

export { FinanceProvider, useFinance };
