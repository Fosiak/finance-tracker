import { Bell, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#292929] bg-[#151515] px-8">
      <p className="text-sm text-zinc-500">September 2026</p>

      <div className="flex items-center gap-5">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-[#1f1f1f] hover:text-white">
          <Bell size={18} />
        </button>

        <Link
          to="/profile"
          className="flex items-center gap-3 border-l border-[#292929] pl-5 transition"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
            U
          </div>

          <div>
            <p className="text-sm font-medium text-white">User</p>

            <p className="text-xs text-zinc-500">Personal account</p>
          </div>

          <ChevronDown size={16} className="text-zinc-500" />
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
