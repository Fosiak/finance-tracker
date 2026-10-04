import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "cookie-notice-dismissed";

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function CookieNotice() {
  const [dismissed, setDismissed] = useState(readDismissed);

  function dismiss() {
    setDismissed(true);

    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Private browsing / storage disabled - the notice will just
      // reappear next visit, which is harmless.
    }
  }

  if (dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border-default bg-surface/95 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie size={18} className="mt-0.5 shrink-0 text-blue-400" />

          <p className="text-sm leading-6 text-slate-400">
            We use cookies that are strictly necessary to keep you signed
            in and protect your account. No tracking, analytics, or
            marketing cookies.{" "}
            <Link
              to="/cookie-policy"
              className="text-blue-400 underline-offset-2 hover:underline"
            >
              Cookie Policy
            </Link>
          </p>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="flex shrink-0 items-center gap-1.5 self-end rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:self-auto"
        >
          Got it
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default CookieNotice;
