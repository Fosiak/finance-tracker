import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function TransactionCard({ description, category, amount, type }) {
  const isIncome = type === "income";

  return (
    <div className="flex items-center justify-between border-b border-[#292929] py-4 last:border-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isIncome ? "bg-white/10" : "bg-[#222222]"
          }`}
        >
          {isIncome ? (
            <ArrowUpRight size={18} className="text-white" />
          ) : (
            <ArrowDownRight size={18} className="text-zinc-400" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-white">{description}</p>

          <p className="mt-1 text-xs text-zinc-600">{category}</p>
        </div>
      </div>

      {/* Amount */}
      <p
        className={`text-sm font-semibold ${
          isIncome ? "text-white" : "text-zinc-400"
        }`}
      >
        {isIncome ? "+" : "-"}
        {amount} zł
      </p>
    </div>
  );
}

export default TransactionCard;
