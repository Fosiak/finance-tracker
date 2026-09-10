import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { useFinance } from "../context/FinanceContext";

function Budget() {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedMonthExpenses,
    selectedMonthBudget,
    setBudget,
  } = useFinance();

  const [amount, setAmount] = useState("");

  useEffect(() => {
    setAmount(selectedMonthBudget ? selectedMonthBudget.toString() : "");
  }, [selectedMonthBudget]);

  const totalExpenses = selectedMonthExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const remaining = selectedMonthBudget - totalExpenses;

  const percentage =
    selectedMonthBudget > 0
      ? Math.min((totalExpenses / selectedMonthBudget) * 100, 100)
      : 0;

  function handleSubmit(event) {
    event.preventDefault();

    const budgetAmount = Number(amount);

    if (budgetAmount <= 0) {
      return;
    }

    setBudget(selectedMonth, budgetAmount);
  }

  const monthName = new Date(`${selectedMonth}-01`).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Budget</h1>

        <p className="mt-1 text-sm text-zinc-500">
          Set and manage your monthly spending limit.
        </p>
      </div>

      {/* Month selector */}
      <div className="mt-8">
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Month
        </label>

        <select
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          className="rounded-lg border border-[#292929] bg-[#181818] px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
        >
          <option value="2026-08">August 2026</option>

          <option value="2026-09">September 2026</option>

          <option value="2026-10">October 2026</option>

          <option value="2026-11">November 2026</option>
        </select>
      </div>

      {/* Overview */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#292929] bg-[#181818] p-6">
          <p className="text-sm text-zinc-500">Monthly budget</p>

          <p className="mt-3 text-2xl font-bold text-white">
            {selectedMonthBudget.toFixed(2)} zł
          </p>
        </div>

        <div className="rounded-xl border border-[#292929] bg-[#181818] p-6">
          <p className="text-sm text-zinc-500">Spent</p>

          <p className="mt-3 text-2xl font-bold text-white">
            {totalExpenses.toFixed(2)} zł
          </p>
        </div>

        <div className="rounded-xl border border-[#292929] bg-[#181818] p-6">
          <p className="text-sm text-zinc-500">Remaining</p>

          <p
            className={`mt-3 text-2xl font-bold ${
              remaining < 0 ? "text-red-400" : "text-white"
            }`}
          >
            {remaining.toFixed(2)} zł
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-xl border border-[#292929] bg-[#181818] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">{monthName}</h2>

            <p className="mt-1 text-sm text-zinc-500">Budget usage</p>
          </div>

          <span className="text-sm font-medium text-zinc-300">
            {percentage.toFixed(0)}%
          </span>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#292929]">
          <div
            className={`h-full rounded-full transition-all ${
              percentage >= 100 ? "bg-red-400" : "bg-white"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Edit budget */}
      <div className="mt-6 max-w-xl rounded-xl border border-[#292929] bg-[#181818] p-6">
        <h2 className="text-base font-semibold text-white">
          Set monthly budget
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Set the maximum amount you want to spend this month.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Budget amount
          </label>

          <div className="flex gap-3">
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="3000.00"
              className="flex-1 rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Budget;
