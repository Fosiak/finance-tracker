import apiRequest from "./api";

function normalize(transaction) {
    return {
        ...transaction,
        amount: Number(transaction.amount),
    };
}

export async function getTransactions() {
    const data = await apiRequest("/api/transactions/");
    return data.map(normalize);
}

export async function createTransaction({ type, amount, category, description, date }) {
    const data = await apiRequest("/api/transactions/", {
        method: "POST",
        body: JSON.stringify({ type, amount, category, description, date }),
    });
    return normalize(data);
}

export async function updateTransaction(id, { type, amount, category, description, date }){
    const data = await apiRequest(`/api/transactions/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ type, amount, category, description, date }),
    });
    return normalize(data);
}

export async function deleteTransaction(id){
    await apiRequest(`/api/transactions/${id}/`, {
        method: "DELETE",
    });
}