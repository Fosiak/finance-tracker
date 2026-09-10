function Sidebar() {
    return (
        <aside className="w-64 min-h-screen bg-gray-900 p-6 text-white">
            <h1 className="text-2xl font-bold">
                Finance Tracker
            </h1>


            <nav className="mt-8">
                <ul className="space-y-3">
                    <li>Dasboard</li>
                    <li>Expenses</li>
                    <li>Statistics</li>
                    <li>Settings</li>
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar