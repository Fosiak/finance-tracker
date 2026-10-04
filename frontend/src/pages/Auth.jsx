import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  WalletCards,
} from "lucide-react";

import { register as registerRequest } from "../services/auth";
import { useAuth } from "../context/AuthContext";

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const authMessage = location.state?.message;
  const { login } = useAuth();

  const [mode, setMode] = useState("login");
  const [registerStep, setRegisterStep] = useState(1);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === "login";

  function switchMode(newMode) {
    if (newMode === mode) return;

    setMode(newMode);
    setRegisterStep(1);

    setUsername("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");

    setError("");
    setMessage("");
    setShowPassword(false);
    setShowPasswordConfirm(false);
  }

  function goToPreviousStep() {
    setError("");
    setRegisterStep(1);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!isLogin && registerStep === 1) {
      setRegisterStep(2);
      return;
    }

    if (!isLogin && password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(username, password);

        const destination = location.state?.from?.pathname || "/dashboard";

        navigate(destination, { replace: true });

        return;
      }

      await registerRequest({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
      });

      setMessage("Account created. Check your email to verify your account.");

      setMode("login");
      setRegisterStep(1);
      setPassword("");
      setPasswordConfirm("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-app text-white">
      {/* lokalna animacja dla pól, które wjeżdżają/wyjeżdżają */}
      <style>{`
        @keyframes fieldIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .field-animate {
          animation: fieldIn 0.25s ease-out;
        }
      `}</style>

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blue-600/10 blur-[80px] sm:-left-40 sm:-top-40 sm:h-125 sm:w-125 sm:blur-[120px]" />

        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-indigo-600/10 blur-[80px] sm:-bottom-40 sm:-right-40 sm:h-125 sm:w-125 sm:blur-[120px]" />

        <div className="absolute left-1/2 top-1/2 hidden h-175 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/2.5 sm:block" />

        <div className="absolute left-1/2 top-1/2 hidden h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/2.5 sm:block" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-start justify-center px-4 py-8 sm:items-center sm:px-6 sm:py-12 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_480px] lg:items-center lg:gap-16">
          {/* LEFT SIDE */}
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 shadow-lg shadow-blue-500/10 transition duration-300 hover:scale-105 hover:border-blue-400/40 hover:bg-blue-500/15">
                  <WalletCards size={22} className="text-blue-400" />
                </div>

                <span className="text-lg font-semibold tracking-tight">
                  Finance Tracker
                </span>
              </div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/10 bg-blue-500/5 px-3 py-1.5 text-xs font-medium text-blue-300 transition duration-300 hover:border-blue-400/20 hover:bg-blue-500/10">
                <Sparkles size={13} />
                Smart financial management
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
                Your money.
                <br />
                <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Your control.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Track your spending, manage budgets and understand where your
                money goes — all in one simple dashboard.
              </p>

              <div className="mt-10 space-y-4">
                <Feature
                  icon={ShieldCheck}
                  title="Secure by design"
                  description="Your financial data is protected with modern security practices."
                />

                <Feature
                  icon={CheckCircle2}
                  title="Clear overview"
                  description="See your balance, expenses and budgets at a glance."
                />

                <Feature
                  icon={WalletCards}
                  title="Everything in one place"
                  description="Keep your personal finances organized without unnecessary complexity."
                />
              </div>
            </div>
          </section>

          {/* AUTH */}
          <section className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
            <div className="mb-6 text-center sm:mb-8 lg:hidden">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 sm:mb-5 sm:h-12 sm:w-12">
                <WalletCards size={21} className="text-blue-400 sm:hidden" />
                <WalletCards
                  size={23}
                  className="hidden text-blue-400 sm:block"
                />
              </div>

              <h1 className="text-xl font-bold sm:text-2xl">Finance Tracker</h1>

              <p className="mt-2 text-sm text-slate-500">
                Take control of your finances.
              </p>
            </div>

            {/* OUTER CARD */}
            <div className="rounded-2xl border border-border-default bg-white/[0.035] p-1.5 shadow-card backdrop-blur-xl sm:rounded-3xl sm:p-2">
              {/* Stała wysokość tylko od lg (gdzie karta stoi obok hero); poniżej auto, karta rośnie z treścią */}
              <div className="h-auto rounded-xl border border-white/5 bg-surface/90 px-4 py-5 sm:rounded-card sm:px-8 sm:py-8 lg:h-190">
                <div className="flex h-full min-h-0 flex-col">
                  {/* Header */}
                  <div className="shrink-0">
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {isLogin ? "Welcome back" : "Create your account"}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {isLogin
                        ? "Sign in to continue to your financial dashboard."
                        : "Start managing your finances with Finance Tracker."}
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="relative mt-5 grid shrink-0 grid-cols-2 rounded-xl border border-border-subtle bg-black/30 p-1 sm:mt-7">
                    <div
                      className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white/8 shadow-sm transition-transform duration-300 ${
                        isLogin ? "translate-x-0" : "translate-x-full"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className={`relative z-10 cursor-pointer rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                        isLogin
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Login
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className={`relative z-10 cursor-pointer rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                        !isLogin
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Register
                    </button>
                  </div>
                  {authMessage && (
                    <div
                      role="alert"
                      className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300"
                    >
                      {authMessage}
                    </div>
                  )}
                  {/* FORM AREA — przycisk zawsze na dole */}
                  <form
                    onSubmit={handleSubmit}
                    className="mt-5 flex min-h-0 flex-1 flex-col sm:mt-7"
                  >
                    {/* Pola formularza — elastyczny, przewijalny obszar (przewija się realnie tylko na lg, gdzie karta ma stałą wysokość) */}
                    <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 sm:space-y-4">
                      {(isLogin || registerStep === 1) && (
                        <InputField
                          id="username"
                          label="Username"
                          type="text"
                          value={username}
                          onChange={setUsername}
                          placeholder="Enter your username"
                          autoComplete="username"
                          icon={User}
                          maxLength={150}
                        />
                      )}

                      {!isLogin && registerStep === 1 && (
                        <>
                          <div className="field-animate">
                            <InputField
                              id="first-name"
                              label="First name"
                              type="text"
                              value={firstName}
                              onChange={setFirstName}
                              placeholder="Jane"
                              autoComplete="given-name"
                              icon={User}
                              maxLength={150}
                            />
                          </div>

                          <div className="field-animate">
                            <InputField
                              id="last-name"
                              label="Last name"
                              type="text"
                              value={lastName}
                              onChange={setLastName}
                              placeholder="Smith"
                              autoComplete="family-name"
                              icon={User}
                              maxLength={150}
                            />
                          </div>
                        </>
                      )}

                      {!isLogin && registerStep === 2 && (
                        <div className="field-animate">
                          <InputField
                            id="email"
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={setEmail}
                            placeholder="you@example.com"
                            autoComplete="email"
                            icon={Mail}
                          />
                        </div>
                      )}

                      {(isLogin || registerStep === 2) && (
                        <PasswordField
                          id="password"
                          label="Password"
                          value={password}
                          onChange={setPassword}
                          placeholder={
                            isLogin
                              ? "Enter your password"
                              : "Create a strong password"
                          }
                          autoComplete={
                            isLogin ? "current-password" : "new-password"
                          }
                          visible={showPassword}
                          onToggle={() => setShowPassword((current) => !current)}
                        />
                      )}

                      {!isLogin && registerStep === 2 && (
                        <div className="field-animate">
                          <PasswordField
                            id="password-confirm"
                            label="Confirm password"
                            value={passwordConfirm}
                            onChange={setPasswordConfirm}
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                            visible={showPasswordConfirm}
                            onToggle={() =>
                              setShowPasswordConfirm((current) => !current)
                            }
                          />
                        </div>
                      )}

                      {/* Messages */}
                      {(error || message) && (
                        <div className="field-animate">
                          {error && (
                            <div
                              role="alert"
                              className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3"
                            >
                              <p className="text-sm leading-5 text-red-400">
                                {error}
                              </p>
                            </div>
                          )}

                          {message && (
                            <div
                              role="status"
                              className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3"
                            >
                              <p className="text-sm leading-5 text-emerald-400">
                                {message}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Submit — zawsze przyklejony do dołu formularza */}
                    <div className="mt-4 flex shrink-0 gap-3">
                      {!isLogin && registerStep === 2 && (
                        <button
                          type="button"
                          onClick={goToPreviousStep}
                          disabled={isLoading}
                          className="shrink-0 rounded-xl border border-border-default px-4 py-3 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5"
                        >
                          Back
                        </button>
                      )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:py-3.5"
                    >
                      <span>
                        {isLogin
                          ? isLoading
                            ? "Signing in..."
                            : "Sign in"
                          : registerStep === 1
                            ? "Continue"
                            : isLoading
                              ? "Creating account..."
                              : "Create account"}
                      </span>

                      {!isLoading && (
                        <ArrowRight
                          size={17}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      )}
                    </button>
                    </div>
                  </form>

                  {/* Security */}
                  <div className="flex shrink-0 items-center justify-center gap-2 pt-3 text-xs text-slate-600 sm:pt-4">
                    <LockKeyhole size={13} />
                    <span>Your connection is protected</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-700 sm:mt-6">
              © 2026 Finance Tracker
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="group flex gap-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/6 bg-white/3 transition-all duration-300 group-hover:border-blue-400/20 group-hover:bg-blue-500/[0.07]">
        <Icon
          size={17}
          className="text-blue-400 transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-200">{title}</h3>

        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon: Icon,
  maxLength,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>

      <div className="group relative">
        <Icon
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-all duration-200 group-focus-within:scale-110 group-focus-within:text-blue-400"
        />

        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          required
          className="w-full rounded-xl border border-border-default bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700 hover:-translate-y-px hover:border-white/[0.14] hover:bg-black/30 focus:border-blue-500/60 focus:bg-blue-500/2 focus:ring-4 focus:ring-blue-500/[0.07] sm:py-3.5"
        />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  visible,
  onToggle,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>

      <div className="group relative">
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-all duration-200 group-focus-within:scale-110 group-focus-within:text-blue-400"
        />

        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full rounded-xl border border-border-default bg-black/20 py-3 pl-11 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700 hover:-translate-y-px hover:border-white/[0.14] hover:bg-black/30 focus:border-blue-500/60 focus:bg-blue-500/2 focus:ring-4 focus:ring-blue-500/[0.07] sm:py-3.5"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-600 transition-all duration-200 hover:scale-110 hover:bg-white/5 hover:text-slate-300 active:scale-95"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export default Auth;
