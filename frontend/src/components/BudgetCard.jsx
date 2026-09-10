function BudgetCard({ budget, spent }) {
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();

  const currentMonth = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const remaining = budget - spent;

  const percentage = Math.min((spent / budget) * 100, 100);

  return (
    <div className="rounded-xl border border-[#292929] bg-[#181818] p-6 shadow-sm">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-zinc-400">Monthly budget</p>

        <p className="mt-1 text-xs text-zinc-600">
          {currentMonth} {currentYear}
        </p>
      </div>

      {/* Remaining */}
      <div className="mt-8">
        <p className="text-2xl font-bold tracking-tight text-white">
          {remaining.toFixed(2)} zł
        </p>

        <p className="mt-1 text-sm text-zinc-500">remaining</p>
      </div>

      {/* Progress */}
      <div className="mt-7">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">{spent.toFixed(2)} zł spent</span>

          <span className="font-medium text-zinc-300">
            {percentage.toFixed(0)}%
          </span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#292929]">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-[#292929] pt-4 text-xs">
        <span className="text-zinc-600">Budget</span>

        <span className="text-zinc-400">{budget.toFixed(2)} zł</span>
      </div>
    </div>
  );
}

export default BudgetCard;
