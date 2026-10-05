import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { focusRing } from "../components/ui/styles";

const API_URL = import.meta.env.VITE_API_URL;

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, refreshUser } = useAuth();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    if (!uid || !token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-email/${uid}/${token}/`,
        );

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.detail || "Email verification failed.");
          return;
        }

        setStatus("success");
        setMessage(data.detail);

        // If they're already logged in in this tab, refresh the cached
        // user so email_verified flips without needing a reload (e.g.
        // dismisses the EmailVerificationBanner immediately).
        if (isAuthenticated) {
          refreshUser();
        }
      } catch {
        setStatus("error");
        setMessage("Could not connect to the server.");
      }
    }

    verifyEmail();
    // Only re-run when the link's params change - isAuthenticated/
    // refreshUser are read at verification time, not reactively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4">
      <div className="w-full max-w-md rounded-card border border-border-default bg-surface p-8 text-center shadow-card">
        <h1 className="text-2xl font-semibold text-white">
          Email verification
        </h1>

        <p className="mt-4 text-sm text-text-muted">{message}</p>

        {status === "loading" && (
          <div className="mt-6 text-sm text-text-faint">Please wait...</div>
        )}

        {status === "success" && (
          <Button as={Link} to={isAuthenticated ? "/dashboard" : "/auth"} className="mt-6">
            {isAuthenticated ? "Go to dashboard" : "Go to login"}
          </Button>
        )}

        {status === "error" && (
          <Link
            to="/"
            className={`mt-6 inline-block rounded-control border border-border-default px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.04] ${focusRing}`}
          >
            Back to home
          </Link>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
