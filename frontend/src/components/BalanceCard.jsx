import { Wallet } from "lucide-react";
import { useFinance } from "../context/FinanceContext";

function BalanceCard() {
  const { monthBalance: balance } = useFinance();

  return (
    <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Balance</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {balance.toFixed(2)} zł
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wallet size={20} />
        </div>
      </div>

      <p className="mt-4 text-xs text-text-faint">Current month</p>
    </div>
  );
}

export default BalanceCard;
