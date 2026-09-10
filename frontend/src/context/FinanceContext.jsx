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
  ]);

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

  return (
    <FinanceContext.Provider
      value={{
        expenses,
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
