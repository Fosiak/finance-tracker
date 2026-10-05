import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

import Button from "./ui/Button";
import { focusRing } from "./ui/styles";

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
          <Cookie size={18} className="mt-0.5 shrink-0 text-primary" />

          <p className="text-sm leading-6 text-text-muted">
            We use cookies that are strictly necessary to keep you signed
            in and protect your account. No tracking, analytics, or
            marketing cookies.{" "}
            <Link
              to="/cookie-policy"
              className={`rounded text-primary underline-offset-2 hover:underline ${focusRing}`}
            >
              Cookie Policy
            </Link>
          </p>
        </div>

        <Button onClick={dismiss} className="self-end sm:self-auto">
          Got it
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}

export default CookieNotice;
