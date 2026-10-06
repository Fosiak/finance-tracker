import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { focusRing } from "../components/ui/styles";
import { requestPasswordReset } from "../services/auth";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const data = await requestPasswordReset(email);
      setMessage(data.detail);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4">
      <div className="w-full max-w-md rounded-card border border-border-default bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-white">
          Forgot your password?
        </h1>

        <p className="mt-2 text-sm text-text-muted">
          Enter your email address and we'll send you a link to reset it.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email address"
            type="email"
            icon={Mail}
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm text-success">
              {message}
            </p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <Link
          to="/auth"
          className={`mt-6 inline-block rounded-control text-sm text-text-muted transition hover:text-white ${focusRing}`}
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
