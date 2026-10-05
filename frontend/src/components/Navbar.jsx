import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Navbar({ onOpenMobileNav }) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName =
    user.first_name || user.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.username;

  const initials = (user.first_name
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
    : user.username.slice(0, 2)
  ).toUpperCase();

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.06] bg-app/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="cursor-pointer rounded-xl p-2 text-slate-500 transition-all duration-200 hover:bg-white/[0.04] hover:text-white lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Page context */}
      <div className="hidden lg:block">
        <p className="text-sm text-slate-500">
          Personal finance
        </p>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative cursor-pointer rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-white/[0.04] hover:text-slate-200"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
        </button>

        {/* User */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-white/[0.04]"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-blue-400">
                {initials}
              </div>
            )}

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-200">
                {displayName}
              </p>

              <p className="text-xs text-slate-600">{user.email}</p>
            </div>

            <ChevronDown
              size={16}
              className={`shrink-0 text-slate-600 transition-transform duration-200 ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border-default bg-surface shadow-card"
            >
              <div className="border-b border-border-default px-4 py-3 sm:hidden">
                <p className="text-sm font-medium text-slate-200">
                  {displayName}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{user.email}</p>
              </div>

              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
              >
                <User size={17} />
                Profile
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-red-500/[0.06] hover:text-red-400"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
