import { useEffect, useState } from "react";

import Dialog from "./ui/Dialog";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";
import { CATEGORIES } from "../constants/categories";

function AddExpenseModal({ isOpen, onClose, onAddExpense, editingExpense }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();

    const expense = {
      id: editingExpense ? editingExpense.id : Date.now(),

      type: "expense",
      amount: Number(amount),
      category,
      description,
      date,
    };

    setIsSubmitting(true);

    try {
      await onAddExpense(expense);

      setAmount("");
      setCategory("");
      setDescription("");
      setDate("");

      onClose();
    } catch {
      // FinanceContext already surfaced this via a toast - keep the
      // modal open with the user's input so they can retry.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? "Edit expense" : "Add expense"}
      description={
        editingExpense
          ? "Update your expense details."
          : "Add a new expense to your budget."
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
        />

        <Select
          label="Category"
          required
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="" disabled>
            Select category
          </option>

          {CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>

        <Input
          label="Description"
          type="text"
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Groceries"
        />

        <Input
          label="Date"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t border-border-default pt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : editingExpense
                ? "Save changes"
                : "Add expense"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default AddExpenseModal;
