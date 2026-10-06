import ExpenseCard from "../components/ExpenseCard";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import BalanceCard from "../components/BalanceCard";
import IncomeCard from "../components/IncomeCard";
import { useFinance } from "../context/FinanceContext";

function Dashboard() {
  const { isLoading, error, selectedMonthTransactions } = useFinance();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-primary">Overview</p>

          <div className="grid gap-4 md:grid-cols-3">
            <BalanceCard />
            <IncomeCard />
            <ExpenseCard />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Keep track of your finances and stay in control of your money.
          </p>
        </div>

        <div className="rounded-2xl border border-border-default bg-surface p-8 shadow-card">
          {error && (
            <p className="mb-4 text-sm text-danger">
              Couldn't load your data: {error}
            </p>
          )}

          {selectedMonthTransactions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No transactions yet this month.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedMonthTransactions.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between border-b border-border-subtle pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {expense.description}
                    </p>
                    <p className="text-xs text-slate-500">{expense.date}</p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      expense.type === "income"
                        ? "text-success"
                        : "text-slate-300"
                    }`}
                  >
                    {expense.type === "income" ? "+" : "-"}
                    {expense.amount.toFixed(2)} zł
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
