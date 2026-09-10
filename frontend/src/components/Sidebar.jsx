import {
  LayoutDashboard,
  Receipt,
  ChartPie,
  Wallet,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      label: "Expenses",
      icon: Receipt,
      path: "/expenses",
    },
    {
      label: "Statistics",
      icon: ChartPie,
      path: "/statistics",
    },
    {
      label: "Budget",
      icon: Wallet,
      path: "/budget",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-[#292929] bg-[#151515] px-4 py-6">
      {/* Logo */}
      <div className="px-3">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Finance Tracker
        </h1>

        <p className="mt-1 text-xs text-zinc-500">Personal finance</p>
      </div>

      {/* Navigation */}
      <nav className="mt-10">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">
          Menu
        </p>

        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:bg-[#1f1f1f] hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom card */}
      <div className="mt-auto">
        <div className="rounded-xl bg-[#1c1c1c] p-4">
          <p className="text-sm font-medium text-white">Finance Tracker</p>

          <p className="mt-1 text-xs text-zinc-500">
            Manage your money smarter.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
