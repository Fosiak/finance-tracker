import { useEffect, useState } from "react";
import { X } from "lucide-react";

function AddExpenseModal({ isOpen, onClose, onAddExpense, editingExpense }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDescription(editingExpense.description);
      setDate(editingExpense.date);
    } else {
      setAmount("");
      setCategory("");
      setDescription("");
      setDate("");
    }
  }, [editingExpense, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const expense = {
      id: editingExpense ? editingExpense.id : Date.now(),

      type: "expense",
      amount: Number(amount),
      category,
      description,
      date,
    };

    onAddExpense(expense);

    setAmount("");
    setCategory("");
    setDescription("");
    setDate("");

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl border border-[#292929] bg-[#181818] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {editingExpense ? "Edit expense" : "Add expense"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {editingExpense
                ? "Update your expense details."
                : "Add a new expense to your budget."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-[#222222] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Amount
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Category
            </label>

            <select
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-zinc-500"
            >
              <option value="" disabled>
                Select category
              </option>

              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="housing">Housing</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
              <option value="subscriptions">Subscriptions</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Description
            </label>

            <input
              type="text"
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Groceries"
              className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Date
            </label>

            <input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-zinc-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-[#292929] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-[#222222] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              {editingExpense ? "Save changes" : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
