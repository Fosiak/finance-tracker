import apiRequest from "./api";

function normalize(budget){
    return {
        ...budget,
        limit: Number(budget.limit),
    };
}

export async function getBudgets(){
    const data = await apiRequest("/api/budgets/");
    return data.map(normalize);
}

export async function setBudgetForMonth(month, limit){
    const data = await apiRequest("/api/budgets/", {
        method: "POST",
        body: JSON.stringify({ month, limit }),
    });
    return normalize(data);
}