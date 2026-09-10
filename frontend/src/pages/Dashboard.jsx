import BalanceCard from "../components/BalanceCard"
import TransactionCard from "../components/TransactionCard"

function Dashboard() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-5xl">

                <h1 className="text-3xl font-bold">
                    Finance Tracker
                </h1>

                <p className="mt-1 text-gray-500">
                    Your financial overview
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <BalanceCard
                        title="Balance"
                        amount="4 954.01"
                    />

                    <BalanceCard
                        title="Income"
                        amount="5 000.00"
                    />

                    <BalanceCard
                        title="Expenses"
                        amount="45.99"
                    />
                </div>

                <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold">
                        Recent transactions
                    </h2>

                    <div className="mt-4">
                        <TransactionCard
                            description="Salary"
                            category="salary"
                            amount="5000.00"
                            type="income"
                        />

                        <TransactionCard
                            description="McDonald's"
                            category="food"
                            amount="45.99"
                            type="expense"
                        />
                    </div>
                </div>

            </div>
        </main>
    )
}

export default Dashboard