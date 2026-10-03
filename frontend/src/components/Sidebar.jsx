import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Settings,
  Wallet,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Expenses",
    path: "/expenses",
    icon: Wallet,
  },
  {
    name: "Statistics",
    path: "/statistics",
    icon: BarChart3,
  },
  {
    name: "Budget",
    path: "/budget",
    icon: Wallet,
  },
];

function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] bg-surface lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet size={19} />
          </div>

          <span className="font-semibold tracking-tight">Finance Tracker</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Overview
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  "cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-blue-400"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-blue-400"
                        : "text-slate-600 transition-colors group-hover:text-slate-300"
                    }
                  />

                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Account
        </p>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            [
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "cursor-pointer",
              isActive
                ? "bg-primary/10 text-blue-400"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
            ].join(" ")
          }
        >
          <Settings size={18} />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.06] p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
