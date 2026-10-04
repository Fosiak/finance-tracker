import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <p className="text-xs text-slate-600">
          © 2026 Finance Tracker
        </p>

        <div className="flex items-center gap-5">
          <Link
            to="/cookie-policy"
            className="text-xs text-slate-600 transition hover:text-slate-400"
          >
            Cookie Policy
          </Link>

          <p className="text-xs text-slate-700">
            Built with security in mind
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;