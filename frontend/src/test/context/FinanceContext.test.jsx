import { renderHook, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FinanceProvider, useFinance } from "../../context/FinanceContext";
import { ToastProvider } from "../../context/ToastContext";
import * as transactionsService from "../../services/transactions";
import * as budgetsService from "../../services/budgets";

vi.mock("../../services/transactions");
vi.mock("../../services/budgets");

const TODAY = new Date("2026-03-15T12:00:00Z");

function renderFinance() {
  return renderHook(() => useFinance(), {
    wrapper: ({ children }) => (
      <ToastProvider>
        <FinanceProvider>{children}</FinanceProvider>
      </ToastProvider>
    ),
  });
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(TODAY);

  transactionsService.getTransactions.mockResolvedValue([
    {
      id: 1,
      type: "expense",
      amount: 50,
      category: "food",
      description: "Groceries",
      date: "2026-03-10",
    },
    {
      id: 2,
      type: "income",
      amount: 4000,
      category: "other",
      description: "Salary",
      date: "2026-03-01",
    },
    {
      id: 3,
      type: "expense",
      amount: 999,
      category: "shopping",
      description: "Last month, should be excluded",
      date: "2026-02-20",
    },
  ]);

  transactionsService.createTransaction.mockImplementation(async (payload) => ({
    id: 99,
    ...payload,
  }));
  transactionsService.updateTransaction.mockImplementation(async (id, payload) => ({
    id,
    ...payload,
  }));
  transactionsService.deleteTransaction.mockResolvedValue(undefined);

  budgetsService.getBudgets.mockResolvedValue([
    { month: "2026-03", limit: 2000 },
  ]);
  budgetsService.setBudgetForMonth.mockImplementation(async (month, limit) => ({
    month,
    limit,
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("FinanceContext", () => {
  it("loads transactions and budgets on mount", async () => {
    const { result } = renderFinance();

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.expenses).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it("derives the selected month's income, expenses and balance, excluding other months", async () => {
    const { result } = renderFinance();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.selectedMonthTransactions).toHaveLength(2);
    expect(result.current.monthIncome).toBe(4000);
    expect(result.current.monthExpenses).toBe(50);
    expect(result.current.monthBalance).toBe(3950);
  });

  it("returns 0 for a month with no budget set", async () => {
    const { result } = renderFinance();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.getBudgetForMonth("2099-01")).toBe(0);
    expect(result.current.selectedMonthBudget).toBe(2000);
  });

  it("adds a transaction and prepends it to the list", async () => {
    const { result } = renderFinance();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addExpense({
        type: "expense",
        amount: 25,
        category: "food",
        description: "Coffee",
        date: "2026-03-15",
      });
    });

    expect(transactionsService.createTransaction).toHaveBeenCalledWith({
      type: "expense",
      amount: 25,
      category: "food",
      description: "Coffee",
      date: "2026-03-15",
    });
    expect(result.current.expenses[0]).toMatchObject({
      id: 99,
      description: "Coffee",
    });
    expect(result.current.expenses).toHaveLength(4);
  });

  it("rejects and leaves state unchanged when adding a transaction fails", async () => {
    transactionsService.createTransaction.mockRejectedValue(
      new Error("Network error"),
    );
    const { result } = renderFinance();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(
        result.current.addExpense({
          type: "expense",
          amount: 25,
          category: "food",
          description: "Coffee",
          date: "2026-03-15",
        }),
      ).rejects.toThrow("Network error");
    });

    expect(result.current.expenses).toHaveLength(3);
  });

  it("deletes a transaction", async () => {
    const { result } = renderFinance();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteExpense(1);
    });

    expect(transactionsService.deleteTransaction).toHaveBeenCalledWith(1);
    expect(result.current.expenses.find((e) => e.id === 1)).toBeUndefined();
    expect(result.current.expenses).toHaveLength(2);
  });

  it("updates a transaction in place", async () => {
    const { result } = renderFinance();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateExpense({
        id: 1,
        type: "expense",
        amount: 75,
        category: "food",
        description: "Groceries (updated)",
        date: "2026-03-10",
      });
    });

    expect(transactionsService.updateTransaction).toHaveBeenCalledWith(1, {
      type: "expense",
      amount: 75,
      category: "food",
      description: "Groceries (updated)",
      date: "2026-03-10",
    });
    expect(result.current.expenses.find((e) => e.id === 1)).toMatchObject({
      amount: 75,
      description: "Groceries (updated)",
    });
  });

  it("sets a budget for a month", async () => {
    const { result } = renderFinance();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setBudget("2026-04", 3000);
    });

    expect(budgetsService.setBudgetForMonth).toHaveBeenCalledWith(
      "2026-04",
      3000,
    );
    expect(result.current.getBudgetForMonth("2026-04")).toBe(3000);
  });

  it("surfaces a load error without crashing", async () => {
    transactionsService.getTransactions.mockRejectedValue(
      new Error("Server unavailable"),
    );
    const { result } = renderFinance();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Server unavailable");
    expect(result.current.expenses).toEqual([]);
  });
});
