import { createContext, useContext, useState } from "react";

const FinanceContext = createContext(null);

function FinanceProvider({ children }) {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      type: "expense",
      amount: 45.99,
      category: "food",
      description: "Groceries",
      date: "2026-09-05",
    },
    {
      id: 2,
      type: "expense",
      amount: 120,
      category: "transport",
      description: "Fuel",
      date: "2026-09-04",
    },
    {
      id: 3,
      type: "expense",
      amount: 49.99,
      category: "subscriptions",
      description: "Netflix",
      date: "2026-09-02",
    },
    {
      id: 4,
      type: "expense",
      amount: 250,
      category: "shopping",
      description: "Clothes",
      date: "2026-08-20",
    },
    {
      id: 5,
      type: "expense",
      amount: 80,
      category: "food",
      description: "Restaurant",
      date: "2026-08-15",
    },
  ]);

  const [selectedMonth, setSelectedMonth] = useState("2026-09");

  const [budgets, setBudgets] = useState({
    "2026-08": 3000,
    "2026-09": 3000,
  });

  function addExpense(expense) {
    setExpenses((currentExpenses) => [expense, ...currentExpenses]);
  }

  function deleteExpense(id) {
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id),
    );
  }

  function updateExpense(updatedExpense) {
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense,
      ),
    );
  }

  function getExpensesForMonth(month) {
    return expenses.filter((expense) => expense.date.startsWith(month));
  }

  function setBudget(month, amount) {
    setBudgets((currentBudgets) => ({
      ...currentBudgets,
      [month]: amount,
    }));
  }

  function getBudgetForMonth(month) {
    return budgets[month] ?? 0;
  }

  const selectedMonthExpenses = getExpensesForMonth(selectedMonth);

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
