import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { focusRing } from "../components/ui/styles";
import { confirmPasswordReset } from "../services/auth";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset({
        uid,
        token,
        newPassword: password,
        newPasswordConfirm: passwordConfirm,
      });

      navigate("/auth", {
        replace: true,
        state: {
          message: "Password changed. Sign in with your new password.",
        },
      });
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
          Set a new password
        </h1>

        {!uid || !token ? (
          <>
            <p role="alert" className="mt-4 text-sm text-danger">
              Invalid password reset link.
            </p>

            <Link
              to="/forgot-password"
              className={`mt-6 inline-block rounded-control text-sm text-text-muted transition hover:text-white ${focusRing}`}
            >
              Request a new link
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="New password"
              type="password"
              icon={LockKeyhole}
              required
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <Input
              label="Confirm new password"
              type="password"
              icon={LockKeyhole}
              required
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
            />

            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : "Reset password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
