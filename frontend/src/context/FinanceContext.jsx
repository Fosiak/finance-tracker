import { createContext, useContext, useEffect, useState } from "react";

import {
  getTransactions,
  createTransaction,
  updateTransaction as updateTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
} from "../services/transactions";
import { getBudgets, setBudgetForMonth } from "../services/budgets";
import { useToast } from "./ToastContext";

const FinanceContext = createContext(null);

function currentMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function sumAmounts(transactions) {
  return transactions.reduce((total, item) => total + item.amount, 0);
}

function FinanceProvider({ children }) {
  const { showSuccess, showError } = useToast();

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
        if (!isCancelled) {
          setError(err.message);
          showError(`Couldn't load your data: ${err.message}`);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [showError]);

  async function addExpense(expense) {
    const payload = expense;

    try {
      const created = await createTransaction(payload);
      setExpenses((current) => [created, ...current]);
      showSuccess("Transaction added.");
    } catch (err) {
      showError(err.message);
      throw err;
    }
  }

  async function deleteExpense(id) {
    try {
      await deleteTransactionRequest(id);
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      showSuccess("Transaction deleted.");
    } catch (err) {
      showError(err.message);
      throw err;
    }
  }

  async function updateExpense(updatedExpense) {
    const { id, ...payload } = updatedExpense;

    try {
      const saved = await updateTransactionRequest(id, payload);
      setExpenses((current) =>
        current.map((expense) => (expense.id === id ? saved : expense)),
      );
      showSuccess("Transaction updated.");
    } catch (err) {
      showError(err.message);
      throw err;
    }
  }

  async function setBudget(month, amount) {
    try {
      const saved = await setBudgetForMonth(month, amount);
      setBudgets((current) => ({ ...current, [month]: saved.limit }));
      showSuccess("Budget updated.");
    } catch (err) {
      showError(err.message);
      throw err;
    }
  }

  function getBudgetForMonth(month) {
    return budgets[month] ?? 0;
  }

  const selectedMonthTransactions = expenses.filter((transaction) =>
    transaction.date.startsWith(selectedMonth),
  );

  const selectedMonthExpenses = selectedMonthTransactions.filter(
    (transaction) => transaction.type === "expense",
  );

  const monthIncome = sumAmounts(
    selectedMonthTransactions.filter(
      (transaction) => transaction.type === "income",
    ),
  );
  const monthExpenses = sumAmounts(selectedMonthExpenses);
  const monthBalance = monthIncome - monthExpenses;

  const selectedMonthBudget = getBudgetForMonth(selectedMonth);

  return (
    <FinanceContext.Provider
      value={{
        expenses,
        selectedMonth,
        setSelectedMonth,
        selectedMonthTransactions,
        selectedMonthExpenses,
        monthIncome,
        monthExpenses,
        monthBalance,

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
