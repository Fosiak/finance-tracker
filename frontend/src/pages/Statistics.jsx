import { useMemo } from "react";
import { Receipt, Wallet, TrendingUp } from "lucide-react";

import CategorySpendingChart from "../components/CategorySpendingChart";

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
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Statistics
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Analyze your spending habits.
          </p>
        </div>

        <select
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          className="rounded-lg border border-[#292929] bg-[#181818] px-4 py-2.5 text-sm font-medium text-zinc-300 outline-none focus:border-zinc-500"
        >
          <option value="2026-08">August 2026</option>

          <option value="2026-09">September 2026</option>

          <option value="2026-10">October 2026</option>

          <option value="2026-11">November 2026</option>
        </select>
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
        <div className="rounded-xl border border-[#292929] bg-[#181818] p-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              Spending by category
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
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
        </div>
      </section>
      {/* Main content */}
      <section className="mt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Categories */}
          <div className="rounded-xl border border-[#292929] bg-[#181818] p-6 lg:col-span-2">
            <div>
              <h2 className="text-base font-semibold text-white">
                Spending by category
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
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

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize text-zinc-300">
                          {category}
                        </span>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-600">
                            {percentage.toFixed(0)}%
                          </span>

                          <span className="text-sm font-medium text-white">
                            {amount.toFixed(2)} zł
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#292929]">
                        <div
                          className="h-full rounded-full bg-white transition-all"
                          style={{
                            width: `${percentage}%`,
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
          </div>

          {/* Top category */}
          <div className="rounded-xl border border-[#292929] bg-[#181818] p-6">
            <p className="text-sm font-medium text-zinc-500">Top category</p>

            {statistics.topCategory ? (
              <>
                <p className="mt-5 text-2xl font-bold capitalize text-white">
                  {statistics.topCategory.category}
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  {statistics.topCategory.amount.toFixed(2)} zł spent
                </p>

                <div className="mt-6 border-t border-[#292929] pt-5">
                  <p className="text-xs text-zinc-600">
                    Share of total spending
                  </p>

                  <p className="mt-1 text-lg font-semibold text-zinc-300">
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
                <p className="text-sm text-zinc-500">No expenses yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Expense list */}
      <section className="mt-6">
        <div className="rounded-xl border border-[#292929] bg-[#181818] p-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              Expense breakdown
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Individual expenses for {monthName}.
            </p>
          </div>

          <div className="mt-5">
            {selectedMonthExpenses.length > 0 ? (
              selectedMonthExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between border-b border-[#292929] py-4 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {expense.description}
                    </p>

                    <p className="mt-1 text-xs capitalize text-zinc-600">
                      {expense.category} · {expense.date}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-zinc-300">
                    {expense.amount.toFixed(2)} zł
                  </p>
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#292929] bg-[#181818] p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500">{title}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#222222]">
          <Icon size={18} className="text-zinc-300" />
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-zinc-500">No expenses for this month.</p>
    </div>
  );
}

export default Statistics;
