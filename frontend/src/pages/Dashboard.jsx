import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";

import BalanceCard from "../components/BalanceCard";
import BudgetCard from "../components/BudgetCard";
import TransactionCard from "../components/TransactionCard";
import SpendingChart from "../components/SpendingChart";
import AddExpenseModal from "../components/AddExpenseModal";

function Dashboard() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      type: "expense",
      amount: 45.99,
      category: "food",
      description: "Groceries",
      date: "2026-09-05",
    },
    {
      id: 2,
      type: "expense",
      amount: 120,
      category: "transport",
      description: "Fuel",
      date: "2026-09-04",
    },
    {
      id: 3,
      type: "expense",
      amount: 49.99,
      category: "subscriptions",
      description: "Netflix",
      date: "2026-09-02",
    },
  ]);

  const income = 5000;

  const budget = 3000;

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const balance = income - totalExpenses;

  const handleAddExpense = (expense) => {
    setExpenses((currentExpenses) => [expense, ...currentExpenses]);
  };

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Good morning 👋
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Here’s your financial overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector */}
          <button className="flex items-center gap-2 rounded-lg border border-[#292929] bg-[#181818] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-[#222222] hover:text-white">
            September 2026
            <ChevronDown size={16} />
          </button>

          {/* Add expense */}
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <Plus size={17} />
            Add expense
          </button>
        </div>
      </div>

      {/* Overview */}
      <section className="mt-8">
        <div className="grid gap-6 md:grid-cols-3">
          <BalanceCard
            title="Balance"
            amount={balance.toFixed(2)}
            type="balance"
          />

          <BalanceCard
            title="Income"
            amount={income.toFixed(2)}
            type="income"
          />

          <BalanceCard
            title="Expenses"
            amount={totalExpenses.toFixed(2)}
            type="expenses"
          />
        </div>
      </section>

      {/* Main section */}
      <section className="mt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Spending chart */}
          <div className="rounded-xl border border-[#292929] bg-[#181818] p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Spending overview
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Your spending throughout the month.
                </p>
              </div>

              <span className="text-sm text-zinc-500">September</span>
            </div>

            <div className="mt-6">
              <SpendingChart />
            </div>
          </div>

          {/* Budget */}
          <BudgetCard budget={budget} spent={totalExpenses} />
        </div>
      </section>

      {/* Recent transactions */}
      <section className="mt-6">
        <div className="rounded-xl border border-[#292929] bg-[#181818] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Recent transactions
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Your latest financial activity.
              </p>
            </div>

            <button className="text-sm font-medium text-zinc-400 transition hover:text-white">
              View all
            </button>
          </div>

          <div className="mt-4">
            {expenses.map((expense) => (
              <TransactionCard
                key={expense.id}
                description={expense.description}
                category={expense.category}
                amount={expense.amount.toFixed(2)}
                type={expense.type}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Add expense modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}

export default Dashboard;
