import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

function Navbar() {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.06] bg-app/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Mobile menu */}
      <button
        type="button"
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
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-white/[0.04]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-blue-400">
            FT
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-200">
              User
            </p>

            <p className="text-xs text-slate-600">
              Personal account
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-slate-600 sm:block"
          />
        </button>
      </div>
    </header>
  );
}

export default Navbar;