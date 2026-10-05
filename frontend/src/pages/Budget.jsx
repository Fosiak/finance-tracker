import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { useFinance } from "../context/FinanceContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";

function Budget() {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedMonthExpenses,
    selectedMonthBudget,
    setBudget,
  } = useFinance();

  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();

    const budgetAmount = Number(amount);

    if (budgetAmount <= 0) {
      return;
    }

    setIsSaving(true);

    try {
      await setBudget(selectedMonth, budgetAmount);
    } catch {
      // FinanceContext already surfaced this via a toast.
    } finally {
      setIsSaving(false);
    }
  }

  const monthName = new Date(`${selectedMonth}-01`).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Budget</h1>

        <p className="mt-1 text-sm text-text-muted">
          Set and manage your monthly spending limit.
        </p>
      </div>

      {/* Month selector */}
      <Select
        label="Month"
        value={selectedMonth}
        onChange={(event) => setSelectedMonth(event.target.value)}
        wrapperClassName="mt-8 max-w-xs"
      >
        <option value="2026-08">August 2026</option>
        <option value="2026-09">September 2026</option>
        <option value="2026-10">October 2026</option>
        <option value="2026-11">November 2026</option>
      </Select>

      {/* Overview */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <p className="text-sm text-text-muted">Monthly budget</p>

          <p className="mt-3 text-2xl font-bold text-white">
            {selectedMonthBudget.toFixed(2)} zł
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-muted">Spent</p>

          <p className="mt-3 text-2xl font-bold text-white">
            {totalExpenses.toFixed(2)} zł
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-muted">Remaining</p>

          <p
            className={`mt-3 text-2xl font-bold ${
              remaining < 0 ? "text-danger" : "text-white"
            }`}
          >
            {remaining.toFixed(2)} zł
          </p>
        </Card>
      </div>

      {/* Progress */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">{monthName}</h2>

            <p className="mt-1 text-sm text-text-muted">Budget usage</p>
          </div>

          <span className="text-sm font-medium text-slate-300">
            {percentage.toFixed(0)}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Budget usage"
          className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]"
        >
          <div
            className={`h-full rounded-full transition-all motion-reduce:transition-none ${
              percentage >= 100 ? "bg-danger" : "bg-primary"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </Card>

      {/* Edit budget */}
      <Card className="mt-6 max-w-xl">
        <h2 className="text-base font-semibold text-white">
          Set monthly budget
        </h2>

        <p className="mt-1 text-sm text-text-muted">
          Set the maximum amount you want to spend this month.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex items-end gap-3">
            <Input
              label="Budget amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="3000.00"
              wrapperClassName="flex-1"
            />

            <Button type="submit" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Budget;
