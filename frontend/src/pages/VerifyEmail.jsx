import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#292929] bg-[#151515] p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">
          Email verification
        </h1>

        <p className="mt-4 text-sm text-gray-400">{message}</p>

        {status === "loading" && (
          <div className="mt-6 text-sm text-gray-500">Please wait...</div>
        )}

        {status === "success" && (
          <Link
            to={isAuthenticated ? "/dashboard" : "/auth"}
            className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
          >
            {isAuthenticated ? "Go to dashboard" : "Go to login"}
          </Link>
        )}

        {status === "error" && (
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg border border-[#333] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#202020]"
          >
            Back to home
          </Link>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
