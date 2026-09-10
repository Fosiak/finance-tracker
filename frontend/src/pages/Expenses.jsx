import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

import AddExpenseModal from "../components/AddExpenseModal";
import { useFinance } from "../context/FinanceContext";

function Expenses() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);

  const [search, setSearch] = useState("");

  const { selectedMonthExpenses, addExpense, deleteExpense, updateExpense } =
    useFinance();

  function handleDeleteExpense(id) {
    deleteExpense(id);
  }

  function handleEditExpense(expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  function handleUpdateExpense(updatedExpense) {
    updateExpense(updatedExpense);

    setEditingExpense(null);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingExpense(null);
  }

  const filteredExpenses = selectedMonthExpenses.filter((expense) =>
    expense.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Expenses
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage and track your expenses.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          <Plus size={17} />
          Add expense
        </button>
      </div>

      {/* Search */}
      <div className="mt-8">
        <div className="relative max-w-sm">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          />

          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-[#292929] bg-[#181818] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Expenses table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#292929] bg-[#181818]">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] border-b border-[#292929] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
          <span>Description</span>
          <span>Category</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center border-b border-[#292929] px-6 py-4 last:border-0"
            >
              {/* Description */}
              <div>
                <p className="text-sm font-medium text-white">
                  {expense.description}
                </p>
              </div>

              {/* Category */}
              <div>
                <span className="rounded-md bg-[#222222] px-2.5 py-1 text-xs text-zinc-400">
                  {expense.category}
                </span>
              </div>

              {/* Date */}
              <p className="text-sm text-zinc-500">{expense.date}</p>

              {/* Amount */}
              <p className="text-sm font-semibold text-zinc-300">
                -{expense.amount.toFixed(2)} zł
              </p>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditExpense(expense)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-[#222222] hover:text-white"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-[#222222] hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-zinc-400">
              No expenses found
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Try a different search or add a new expense.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddExpense={editingExpense ? handleUpdateExpense : addExpense}
        editingExpense={editingExpense}
      />
    </div>
  );
}

export default Expenses;
