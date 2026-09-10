import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

function BalanceCard({ title, amount, type }) {
  const icons = {
    balance: Wallet,
    income: ArrowUpRight,
    expenses: ArrowDownRight,
  };

  const Icon = icons[type] || Wallet;

  return (
    <div className="rounded-xl border border-[#292929] bg-[#181818] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{title}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#222222]">
          <Icon size={18} className="text-zinc-300" />
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight text-white">
        {amount} zł
      </p>

      <p className="mt-2 text-xs text-zinc-500">September 2026</p>
    </div>
  );
}

export default BalanceCard;
