import { Outlet } from "react-router-dom";
import { Lock } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function RequireVerifiedEmail() {
  const { user } = useAuth();

  if (!user.email_verified) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
          <Lock size={24} className="text-amber-400" />
        </div>

        <h1 className="mt-6 text-xl font-semibold text-white">
          Verify your email to unlock this page
        </h1>

        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Confirm your email address to access Statistics. Use the resend
          link in the banner above if your verification email expired.
        </p>
      </div>
    );
  }

  return <Outlet />;
}

export default RequireVerifiedEmail;
