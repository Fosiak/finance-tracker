import { useMemo } from "react";
import { Receipt, Wallet, TrendingUp } from "lucide-react";

import CategorySpendingChart from "../components/CategorySpendingChart";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Pill from "../components/ui/Pill";
import { getCategory } from "../constants/categories";

import { useFinance } from "../context/FinanceContext";

function Statistics() {
  const { selectedMonth, setSelectedMonth, selectedMonthExpenses } =
    useFinance();

  const statistics = useMemo(() => {
    const total = selectedMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    const count = selectedMonthExpenses.length;

    const average = count > 0 ? total / count : 0;

    const categoryTotals = selectedMonthExpenses.reduce(
      (categories, expense) => {
        categories[expense.category] =
          (categories[expense.category] || 0) + expense.amount;

        return categories;
      },
      {},
    );

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
      }));

    const topCategory =
      sortedCategories.length > 0 ? sortedCategories[0] : null;

    return {
      total,
      count,
      average,
      sortedCategories,
      topCategory,
    };
  }, [selectedMonthExpenses]);

  const monthName = new Date(`${selectedMonth}-01`).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Statistics
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Analyze your spending habits.
          </p>
        </div>

        <Select
          label="Month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          wrapperClassName="shrink-0"
          className="py-2.5"
        >
          <option value="2026-08">August 2026</option>
          <option value="2026-09">September 2026</option>
          <option value="2026-10">October 2026</option>
          <option value="2026-11">November 2026</option>
        </Select>
      </div>

      {/* Summary */}
      <section className="mt-8">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Total spent"
            value={`${statistics.total.toFixed(2)} zł`}
            icon={Wallet}
          />

          <StatCard
            title="Average expense"
            value={`${statistics.average.toFixed(2)} zł`}
            icon={TrendingUp}
          />

          <StatCard
            title="Transactions"
            value={statistics.count}
            icon={Receipt}
          />
        </div>
      </section>

      {/* Chart */}
      <section className="mt-6">
        <Card>
          <div>
            <h2 className="text-base font-semibold text-white">
              Spending by category
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Compare your spending across categories.
            </p>
          </div>

          <div className="mt-6">
            {statistics.sortedCategories.length > 0 ? (
              <CategorySpendingChart data={statistics.sortedCategories} />
            ) : (
              <EmptyState />
            )}
          </div>
        </Card>
      </section>

      {/* Main content */}
      <section className="mt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Categories */}
          <Card className="lg:col-span-2">
            <div>
              <h2 className="text-base font-semibold text-white">
                Spending by category
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Where your money goes in {monthName}.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {statistics.sortedCategories.length > 0 ? (
                statistics.sortedCategories.map(({ category, amount }) => {
                  const percentage =
                    statistics.total > 0
                      ? (amount / statistics.total) * 100
                      : 0;
                  const meta = getCategory(category);

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between">
                        <Pill category={category} />

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-text-faint">
                            {percentage.toFixed(0)}%
                          </span>

                          <span className="text-sm font-medium text-white">
                            {amount.toFixed(2)} zł
                          </span>
                        </div>
                      </div>

                      <div
                        role="progressbar"
                        aria-valuenow={Math.round(percentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${meta.label} spending`}
                        className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"
                      >
                        <div
                          className="h-full rounded-full transition-all motion-reduce:transition-none"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: meta.chartColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState />
              )}
            </div>
          </Card>

          {/* Top category */}
          <Card>
            <p className="text-sm font-medium text-text-muted">Top category</p>

            {statistics.topCategory ? (
              <>
                <div className="mt-5">
                  <Pill category={statistics.topCategory.category} />
                </div>

                <p className="mt-3 text-2xl font-bold text-white">
                  {statistics.topCategory.amount.toFixed(2)} zł
                </p>

                <div className="mt-6 border-t border-border-default pt-5">
                  <p className="text-xs text-text-faint">
                    Share of total spending
                  </p>

                  <p className="mt-1 text-lg font-semibold text-slate-300">
                    {(
                      (statistics.topCategory.amount / statistics.total) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </>
            ) : (
              <div className="mt-5">
                <p className="text-sm text-text-muted">No expenses yet.</p>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Expense list */}
      <section className="mt-6">
        <Card>
          <div>
            <h2 className="text-base font-semibold text-white">
              Expense breakdown
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Individual expenses for {monthName}.
            </p>
          </div>

          <div className="mt-5">
            {selectedMonthExpenses.length > 0 ? (
              selectedMonthExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between border-b border-border-default py-4 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {expense.description}
                    </p>

                    <p className="mt-1 text-xs text-text-faint">
                      {getCategory(expense.category).label} · {expense.date}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-300">
                    {expense.amount.toFixed(2)} zł
                  </p>
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted">{title}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-control bg-white/[0.04]">
          <Icon size={18} className="text-slate-300" />
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-text-muted">No expenses for this month.</p>
    </div>
  );
}

export default Statistics;
