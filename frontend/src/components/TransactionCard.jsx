import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function TransactionCard({ description, category, amount, type }) {
  const isIncome = type === "income";

  return (
    <div className="flex items-center justify-between border-b border-border-default py-4 last:border-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-control ${
            isIncome ? "bg-success/10" : "bg-white/[0.04]"
          }`}
        >
          {isIncome ? (
            <ArrowUpRight size={18} className="text-success" />
          ) : (
            <ArrowDownRight size={18} className="text-text-muted" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-white">{description}</p>

          <p className="mt-1 text-xs text-text-faint">{category}</p>
        </div>
      </div>

      {/* Amount */}
      <p
        className={`text-sm font-semibold ${
          isIncome ? "text-success" : "text-slate-300"
        }`}
      >
        {isIncome ? "+" : "-"}
        {amount} zł
      </p>
    </div>
  );
}

export default TransactionCard;
