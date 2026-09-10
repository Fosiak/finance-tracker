function BalanceCard({ title, amount }) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-2 text-2xl font-bold">{amount} zł</p>
        </div>
    )
}

export default BalanceCard