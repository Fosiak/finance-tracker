import { Link } from "react-router-dom";
import { ArrowLeft, Cookie } from "lucide-react";

const cookies = [
  {
    name: "access_token",
    purpose: "Keeps you signed in and authorizes your requests to the API.",
    type: "Strictly necessary",
    duration: "10 minutes",
    httpOnly: true,
  },
  {
    name: "refresh_token",
    purpose: "Renews your session without asking you to log in again.",
    type: "Strictly necessary",
    duration: "7 days",
    httpOnly: true,
  },
  {
    name: "csrftoken",
    purpose:
      "Protects your account from cross-site request forgery (CSRF) attacks on actions like adding an expense or changing your profile.",
    type: "Strictly necessary",
    duration: "1 year",
    httpOnly: false,
  },
];

function CookiePolicy() {
  return (
    <div className="min-h-screen bg-app px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-300"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
            <Cookie size={20} className="text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cookie Policy
          </h1>
        </div>

        <p className="mt-6 text-sm leading-7 text-slate-400">
          Finance Tracker only uses cookies that are <strong>strictly
          necessary</strong> for the site to work — signing you in, keeping
          your session alive, and protecting your account from forged
          requests. We do not use analytics, advertising, or tracking
          cookies, and we do not share any cookie data with third parties.
        </p>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Because every cookie below is required for core functionality
          (there is nothing optional to opt out of), we don't show a
          cookie-consent banner asking you to accept or reject them — only
          this notice explaining what they do, as required by law.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border-default">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-default bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Cookie</th>
                <th className="px-5 py-3 font-semibold">Purpose</th>
                <th className="px-5 py-3 font-semibold">Duration</th>
                <th className="px-5 py-3 font-semibold">Readable by scripts</th>
              </tr>
            </thead>

            <tbody>
              {cookies.map((cookie) => (
                <tr
                  key={cookie.name}
                  className="border-b border-border-default last:border-0"
                >
                  <td className="px-5 py-4 font-mono text-xs text-blue-300">
                    {cookie.name}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {cookie.purpose}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {cookie.duration}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {cookie.httpOnly ? "No" : "Yes (required for CSRF protection)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-lg font-semibold text-white">
          Why these cookies need to be set this way
        </h2>

        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
          <li>
            <strong className="text-slate-300">access_token</strong> and{" "}
            <strong className="text-slate-300">refresh_token</strong> are
            marked <code className="text-xs">HttpOnly</code>, so they can
            never be read by JavaScript — this protects them even if a
            malicious script were ever injected into the page.
          </li>
          <li>
            <strong className="text-slate-300">csrftoken</strong> must be
            readable by our own frontend code so it can be echoed back as a
            header on every request that changes your data, proving the
            request really came from our app.
          </li>
          <li>
            All cookies are sent only over HTTPS (<code className="text-xs">Secure</code>)
            and only to our own domains (<code className="text-xs">SameSite=Lax</code>).
          </li>
        </ul>

        <h2 className="mt-10 text-lg font-semibold text-white">Questions?</h2>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          If you have questions about how we use cookies, you can reach us
          through the contact details on your account.
        </p>
      </div>
    </div>
  );
}

export default CookiePolicy;
