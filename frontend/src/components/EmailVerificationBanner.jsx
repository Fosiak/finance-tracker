import { useState } from "react";
import { MailWarning } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { resendVerificationEmail } from "../services/auth";

function EmailVerificationBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  if (user.email_verified) {
    return null;
  }

  async function handleResend() {
    setStatus("sending");
    setMessage("");

    try {
      await resendVerificationEmail();
      setStatus("sent");
      setMessage("Verification email sent — check your inbox.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-sm sm:px-6 lg:px-8">
      <MailWarning size={17} className="shrink-0 text-amber-400" />

      <p className="text-amber-200">
        Please confirm your email address ({user.email}) to unlock full
        access.
      </p>

      <button
        type="button"
        onClick={handleResend}
        disabled={status === "sending" || status === "sent"}
        className="ml-auto shrink-0 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending"
          ? "Sending..."
          : status === "sent"
            ? "Sent"
            : "Resend verification email"}
      </button>

      {message && (
        <p
          className={`w-full text-xs ${
            status === "error" ? "text-red-400" : "text-amber-300"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default EmailVerificationBanner;
