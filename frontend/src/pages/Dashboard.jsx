import { useEffect, useState } from "react";
import ExpenseCard from "../components/ExpenseCard";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import BalanceCard from "../components/BalanceCard";
import IncomeCard from "../components/IncomeCard";
function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tymczasowe — później zastąpi to prawdziwy request do API.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">Overview</p>

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
          <p className="text-sm text-slate-500">
            Dashboard content will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
