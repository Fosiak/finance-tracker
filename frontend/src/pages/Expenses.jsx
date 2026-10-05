import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

import AddExpenseModal from "../components/AddExpenseModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Pill from "../components/ui/Pill";
import { focusRing } from "../components/ui/styles";
import { useFinance } from "../context/FinanceContext";

function Expenses() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);

  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const { selectedMonthExpenses, addExpense, deleteExpense, updateExpense } =
    useFinance();

  async function handleDeleteExpense(id) {
    setDeletingId(id);

    try {
      await deleteExpense(id);
    } catch {
      // FinanceContext already surfaced this via a toast.
    } finally {
      setDeletingId(null);
    }
  }

  function handleEditExpense(expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  async function handleUpdateExpense(updatedExpense) {
    await updateExpense(updatedExpense);

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
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Expenses
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Manage and track your expenses.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={17} />
          Add expense
        </Button>
      </div>

      {/* Search */}
      <div className="mt-8">
        <Input
          icon={Search}
          type="text"
          placeholder="Search expenses..."
          aria-label="Search expenses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          wrapperClassName="max-w-sm"
        />
      </div>

      {/* Expenses table */}
      <Card padding="p-0" className="mt-6 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] border-b border-border-default px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-faint">
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
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center border-b border-border-default px-6 py-4 last:border-0"
            >
              {/* Description */}
              <div>
                <p className="text-sm font-medium text-white">
                  {expense.description}
                </p>
              </div>

              {/* Category */}
              <div>
                <Pill category={expense.category} />
              </div>

              {/* Date */}
              <p className="text-sm text-text-muted">{expense.date}</p>

              {/* Amount */}
              <p className="text-sm font-semibold text-slate-300">
                -{expense.amount.toFixed(2)} zł
              </p>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditExpense(expense)}
                  aria-label={`Edit ${expense.description}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-control text-text-muted transition hover:bg-white/[0.04] hover:text-white ${focusRing}`}
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  disabled={deletingId === expense.id}
                  aria-label={`Delete ${expense.description}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-control text-text-muted transition hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-300">
              No expenses found
            </p>

            <p className="mt-1 text-xs text-text-faint">
              Try a different search or add a new expense.
            </p>
          </div>
        )}
      </Card>

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
