function TransactionCard({ description, category, amount, type }) {
    const isIncome = type == "income"

    return (
        <div className="flex items-center justify-between border-b border-gray-100 py-4">
            <div>
                <p className="font-medium">{description}</p>
                <p className="text-sm text-gray-500">{category}</p>
            </div>

            <p className="font-semibold">
                {isIncome ? "+" : "-"}{amount} zł
            </p>
        </div>
    )
}

export default TransactionCard