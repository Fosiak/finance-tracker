import { useEffect } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Wallet,
  X,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

import { focusRing } from "./ui/styles";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
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

function Sidebar({ isOpen, onClose, triggerRef }) {
  const location = useLocation();

  // Close the mobile drawer whenever the route changes (e.g. the user
  // tapped a nav link) so it doesn't stay open over the new page. Focus
  // naturally moves on with the navigation here, so it shouldn't be
  // pulled back to the hamburger - only the manual-close paths below do.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function closeAndReturnFocus() {
    onClose();
    triggerRef?.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeAndReturnFocus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      {/* Backdrop - mobile/tablet only */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={closeAndReturnFocus}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-surface transition-transform duration-300 ease-out motion-reduce:transition-none lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/[0.06] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-control bg-primary/10 text-primary">
              <Wallet size={19} />
            </div>

            <span className="font-semibold tracking-tight">Finance Tracker</span>
          </div>

          <button
            type="button"
            onClick={closeAndReturnFocus}
            aria-label="Close navigation"
            className={`cursor-pointer rounded-control p-1.5 text-text-muted transition hover:bg-white/[0.04] hover:text-white lg:hidden ${focusRing}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-faint">
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
                    "group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "cursor-pointer",
                    focusRing,
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-muted hover:bg-white/[0.04] hover:text-slate-200",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-text-faint transition-colors group-hover:text-slate-300"
                      }
                    />

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
