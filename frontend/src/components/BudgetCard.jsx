import Card from "./ui/Card";

function BudgetCard({ budget, spent }) {
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();

  const currentMonth = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const remaining = budget - spent;

  const percentage = Math.min((spent / budget) * 100, 100);

  return (
    <Card>
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-text-muted">Monthly budget</p>

        <p className="mt-1 text-xs text-text-faint">
          {currentMonth} {currentYear}
        </p>
      </div>

      {/* Remaining */}
      <div className="mt-8">
        <p className="text-2xl font-bold tracking-tight text-white">
          {remaining.toFixed(2)} zł
        </p>

        <p className="mt-1 text-sm text-text-muted">remaining</p>
      </div>

      {/* Progress */}
      <div className="mt-7">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">{spent.toFixed(2)} zł spent</span>

          <span className="font-medium text-slate-300">
            {percentage.toFixed(0)}%
          </span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full transition-all motion-reduce:transition-none ${
              percentage >= 100 ? "bg-danger" : "bg-primary"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-border-default pt-4 text-xs">
        <span className="text-text-faint">Budget</span>

        <span className="text-text-muted">{budget.toFixed(2)} zł</span>
      </div>
    </Card>
  );
}

export default BudgetCard;
