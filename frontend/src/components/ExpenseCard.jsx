import { TrendingDown } from "lucide-react";
import { useFinance } from "../context/FinanceContext";

function ExpenseCard() {
  const { selectedMonthExpenses } = useFinance();

  const expenses = selectedMonthExpenses
    .filter((expense) => expense.type === "expense")
    .reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Expenses</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            -{expenses.toFixed(2)} zł
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <TrendingDown size={20} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-600">Current month</p>
    </div>
  );
}

export default ExpenseCard;
