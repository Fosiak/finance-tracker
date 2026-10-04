import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Change to "PLN" (and the locale below to "pl-PL") to show złoty everywhere.
const CURRENCY = "USD";
const LOCALE = "en-US";

const money = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

const moneyRound = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

const SECTION_IDS = ["demo", "savings", "faq"];

/* -------------------------------------------------------------------------- */
/*  Demo data                                                                 */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  { id: "housing", name: "Housing", bar: "bg-blue-500", stroke: "#3b82f6" },
  { id: "food", name: "Food", bar: "bg-sky-300", stroke: "#7dd3fc" },
  {
    id: "transport",
    name: "Transport",
    bar: "bg-indigo-400",
    stroke: "#818cf8",
  },
  { id: "leisure", name: "Leisure", bar: "bg-slate-500", stroke: "#64748b" },
];

const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
);

const INITIAL_EXPENSES = [
  { id: 1, title: "Rent", category: "housing", amount: 1200, day: "Sep 1" },
  { id: 2, title: "Groceries", category: "food", amount: 286.4, day: "Sep 6" },
  {
    id: 3,
    title: "Electricity",
    category: "housing",
    amount: 64.2,
    day: "Sep 8",
  },
  {
    id: 4,
    title: "Metro pass",
    category: "transport",
    amount: 42,
    day: "Sep 10",
  },
  { id: 5, title: "Cinema", category: "leisure", amount: 28, day: "Sep 14" },
  {
    id: 6,
    title: "Lunch with Anna",
    category: "food",
    amount: 18.5,
    day: "Sep 17",
  },
];

const INITIAL_LIMITS = {
  housing: 1400,
  food: 450,
  transport: 120,
  leisure: 150,
};

const INCOME = 3650;
const OPENING_BALANCE = 9400;

const PAST_MONTHS = [
  { month: "Apr", income: 3400, spent: 1520 },
  { month: "May", income: 3500, spent: 1710 },
  { month: "Jun", income: 3450, spent: 1590 },
  { month: "Jul", income: 3600, spent: 1830 },
  { month: "Aug", income: 3550, spent: 1660 },
];

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "expenses", label: "Expenses" },
  { id: "statistics", label: "Statistics" },
  { id: "budget", label: "Budget" },
];

const STEPS = [
  {
    title: "Create your account",
    text: "Choose a username and a password. It takes less than a minute.",
  },
  {
    title: "Verify your email",
    text: "Open the confirmation link we send you to activate your account.",
  },
  {
    title: "Add your first expense",
    text: "Head to your dashboard and log something. Statistics and budgets start filling in right away.",
  },
];

const FAQ = [
  {
    question: "Do I need to verify my email?",
    answer:
      "Yes. After you create an account we send you a confirmation link. Open it once and your account is ready to use.",
  },
  {
    question: "What can I keep track of?",
    answer:
      "Your expenses with categories, a monthly budget for each category, and statistics that show where your money goes.",
  },
  {
    question: "Can I change my budget limits later?",
    answer:
      "Yes. You can adjust your limits at any time on the Budget page, exactly like in the demo above.",
  },
  {
    question: "Is the demo using my data?",
    answer:
      "No. The demo runs in your browser with sample numbers. Nothing you type there is saved or sent anywhere.",
  },
  {
    question: "Where do I manage my account details?",
    answer: "On your Profile page, once you are signed in.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Styles shared across the page                                             */
/* -------------------------------------------------------------------------- */

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const primaryButton = `rounded-lg bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-hover ${focusRing}`;
const secondaryButton = `rounded-lg border border-border-strong px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-white/[0.18] hover:bg-white/[0.04] ${focusRing}`;
const inputClass =
  "w-full rounded-lg border border-slate-600 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Smoothly tweens a number whenever `target` changes. */
function useAnimatedNumber(target, duration = 700) {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      valueRef.current = target;
      setValue(target);
      return undefined;
    }

    const from = valueRef.current;
    const start = performance.now();
    let frame = 0;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;

      valueRef.current = next;
      setValue(next);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

/** Highlights whichever section is in the middle of the viewport. */
function useActiveSection(ids) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;

          setActive((previous) => {
            if (entry.isIntersecting) return id;
            return previous === id ? "" : previous;
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );

    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function useInView(ref) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

/** Where the main call to action should lead, depending on auth state. */
function useCta() {
  return {
    to: "/auth",
    label: "Create account",
    state: { mode: "register" },
    isAuthenticated: false,
  };
}

function scrollToId(event, id) {
  const element = document.getElementById(id);
  if (!element) return;

  event.preventDefault();
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

const ICONS = {
  chevronDown: "m6 9 6 6 6-6",
  close: "M18 6 6 18M6 6l12 12",
  plus: "M5 12h14M12 5v14",
  trash:
    "M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
  reset: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5",
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 17l5-5 4 4 7-8" />
        <path d="M15 8h5v5" />
      </svg>
    </span>
  );
}

function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-card border border-border-default bg-surface shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

function CtaLink({ cta, className = primaryButton, label }) {
  return (
    <Link to={cta.to} state={cta.state} className={className}>
      {label ?? cta.label}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: Dashboard                                                           */
/* -------------------------------------------------------------------------- */

function DashboardPanel({ expenses, totalSpent, onGo }) {
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(id);
  }, []);

  const series = [
    ...PAST_MONTHS,
    { month: "Sep", income: INCOME, spent: totalSpent },
  ];

  const scaleMax = Math.max(4000, ...series.map((item) => item.spent));
  const selectedIndex = hovered ?? series.length - 1;
  const selected = series[selectedIndex];

  const saved = INCOME - totalSpent;
  const savingsRate = Math.round((saved / INCOME) * 100);

  const recent = [...expenses].reverse().slice(0, 3);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-700/60 bg-[#0f172a] px-4 py-3">
            <p className="text-xs text-slate-500">Income</p>
            <p className="mt-1 text-base font-semibold text-white tabular-nums sm:text-lg">
              {moneyRound.format(INCOME)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-700/60 bg-[#0f172a] px-4 py-3">
            <p className="text-xs text-slate-500">Expenses</p>
            <p className="mt-1 text-base font-semibold text-white tabular-nums sm:text-lg">
              {moneyRound.format(totalSpent)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-700/60 bg-[#0f172a] px-4 py-3">
            <p className="text-xs text-slate-500">Saved</p>
            <p
              className={`mt-1 text-base font-semibold tabular-nums sm:text-lg ${
                saved >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {savingsRate}%
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex h-28 items-end gap-2">
            {series.map((item, index) => (
              <button
                key={item.month}
                type="button"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                aria-label={`${item.month}: income ${moneyRound.format(
                  item.income,
                )}, expenses ${moneyRound.format(item.spent)}`}
                className={`flex h-full flex-1 items-end justify-center gap-1 rounded-lg px-1 transition ${
                  index === selectedIndex ? "bg-slate-700/30" : ""
                } ${focusRing}`}
              >
                <span
                  className="w-3 rounded-t bg-blue-500 transition-[height] duration-700 ease-out motion-reduce:transition-none"
                  style={{
                    height: ready ? `${(item.income / scaleMax) * 100}%` : "0%",
                    transitionDelay: `${index * 60}ms`,
                  }}
                />
                <span
                  className="w-3 rounded-t bg-slate-500 transition-[height] duration-700 ease-out motion-reduce:transition-none"
                  style={{
                    height: ready ? `${(item.spent / scaleMax) * 100}%` : "0%",
                    transitionDelay: `${index * 60 + 40}ms`,
                  }}
                />
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            {series.map((item, index) => (
              <span
                key={item.month}
                className={`flex-1 text-center text-xs ${
                  index === selectedIndex ? "text-white" : "text-slate-500"
                }`}
              >
                {item.month}
              </span>
            ))}
          </div>

          <p className="mt-4 text-sm text-slate-400" aria-live="polite">
            <span className="font-medium text-white">{selected.month}:</span>{" "}
            earned {moneyRound.format(selected.income)}, spent{" "}
            {moneyRound.format(selected.spent)}
          </p>
        </div>
      </div>

      <div className="lg:col-span-2">
        <h3 className="text-sm font-medium text-white">Latest expenses</h3>

        <ul className="mt-2 divide-y divide-slate-700/40">
          {recent.map((expense) => (
            <li
              key={expense.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    CATEGORY_BY_ID[expense.category].bar
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {expense.title}
                  </p>
                  <p className="text-xs text-slate-500">{expense.day}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 tabular-nums">
                -{money.format(expense.amount)}
              </p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onGo("expenses")}
          className={`mt-3 rounded-lg text-sm font-medium text-blue-400 transition hover:text-blue-300 ${focusRing}`}
        >
          Add or edit expenses
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: Expenses                                                            */
/* -------------------------------------------------------------------------- */

function ExpensesPanel({
  expenses,
  highlightId,
  lastAdded,
  onAdd,
  onDelete,
  onGo,
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const value = parseFloat(amount.replace(",", "."));

    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    if (value > 99999) {
      setError(`Enter an amount below ${moneyRound.format(100000)}.`);
      return;
    }

    setError("");

    onAdd({
      title: title.trim() || CATEGORY_BY_ID[category].name,
      category,
      amount: Math.round(value * 100) / 100,
    });

    setTitle("");
    setAmount("");
  }

  const visible = [...expenses]
    .reverse()
    .filter((expense) => filter === "all" || expense.category === filter);

  const counts = useMemo(() => {
    const result = { all: expenses.length };
    CATEGORIES.forEach((item) => {
      result[item.id] = expenses.filter((e) => e.category === item.id).length;
    });
    return result;
  }, [expenses]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 lg:col-span-2"
        noValidate
      >
        <div>
          <label
            htmlFor="demo-title"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            What did you spend on?
          </label>
          <input
            id="demo-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Coffee"
            maxLength={40}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="demo-amount"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Amount
          </label>
          <input
            id="demo-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">Category</p>

          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Category"
          >
            {CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={category === item.id}
                onClick={() => setCategory(item.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${focusRing} ${
                  category === item.id
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${item.bar}`} />
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className={`flex w-full items-center justify-center gap-2 ${primaryButton}`}
        >
          <Icon name="plus" />
          Add expense
        </button>

        <div aria-live="polite">
          {lastAdded && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3">
              <p className="text-sm text-blue-200">
                Added "{lastAdded.title}". See what changed:
              </p>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => onGo("statistics")}
                  className={`rounded-lg border border-blue-400/40 px-3 py-1.5 text-xs font-medium text-blue-200 transition hover:bg-blue-500/20 ${focusRing}`}
                >
                  Statistics
                </button>
                <button
                  type="button"
                  onClick={() => onGo("budget")}
                  className={`rounded-lg border border-blue-400/40 px-3 py-1.5 text-xs font-medium text-blue-200 transition hover:bg-blue-500/20 ${focusRing}`}
                >
                  Budget
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      <div className="lg:col-span-3">
        <div className="flex flex-wrap gap-2">
          {[{ id: "all", name: "All" }, ...CATEGORIES].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${focusRing} ${
                filter === item.id
                  ? "bg-slate-200 text-slate-900"
                  : "bg-slate-700/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.name} ({counts[item.id]})
            </button>
          ))}
        </div>

        <ul className="mt-3 max-h-72 divide-y divide-slate-700/40 overflow-y-auto pr-1">
          {visible.length === 0 && (
            <li className="py-10 text-center text-sm text-slate-500">
              No expenses in this category yet. Add one on the left.
            </li>
          )}

          {visible.map((expense) => (
            <li
              key={expense.id}
              className={`flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors duration-700 ${
                highlightId === expense.id ? "bg-blue-500/15" : "bg-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    CATEGORY_BY_ID[expense.category].bar
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {expense.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {CATEGORY_BY_ID[expense.category].name} · {expense.day}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-300 tabular-nums">
                  -{money.format(expense.amount)}
                </p>

                <button
                  type="button"
                  onClick={() => onDelete(expense.id)}
                  aria-label={`Remove ${expense.title}`}
                  className={`rounded-lg p-2 text-slate-500 transition hover:bg-slate-700/50 hover:text-red-400 ${focusRing}`}
                >
                  <Icon name="trash" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: Statistics                                                          */
/* -------------------------------------------------------------------------- */

const RADIUS = 64;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function StatisticsPanel({ spentByCategory, totalSpent }) {
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);

  const focusId = pinned ?? hovered;

  const rows = CATEGORIES.map((item) => ({
    ...item,
    amount: spentByCategory[item.id],
    share: totalSpent > 0 ? spentByCategory[item.id] / totalSpent : 0,
  })).sort((a, b) => b.amount - a.amount);

  let offset = 0;
  const segments = rows
    .filter((row) => row.amount > 0)
    .map((row) => {
      const length = row.share * CIRCUMFERENCE;
      const segment = { ...row, length, offset };
      offset += length;
      return segment;
    });

  const focused = rows.find((row) => row.id === focusId);
  const top = rows[0];

  if (totalSpent === 0) {
    return (
      <p className="py-20 text-center text-sm text-slate-500">
        Nothing to show yet. Add an expense to see your statistics.
      </p>
    );
  }

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className="relative mx-auto h-56 w-56">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            fill="none"
            stroke="#0f172a"
            strokeWidth="18"
          />

          {segments.map((segment) => (
            <circle
              key={segment.id}
              cx="80"
              cy="80"
              r={RADIUS}
              fill="none"
              stroke={segment.stroke}
              strokeWidth={focusId === segment.id ? 22 : 18}
              strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
              strokeDashoffset={-segment.offset}
              opacity={focusId && focusId !== segment.id ? 0.3 : 1}
              className="cursor-pointer transition-all duration-300 motion-reduce:transition-none"
              onMouseEnter={() => setHovered(segment.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() =>
                setPinned((current) =>
                  current === segment.id ? null : segment.id,
                )
              }
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-slate-500">
            {focused ? focused.name : "Total spent"}
          </p>
          <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
            {moneyRound.format(focused ? focused.amount : totalSpent)}
          </p>
          {focused && (
            <p className="text-xs text-slate-400">
              {Math.round(focused.share * 100)}% of spending
            </p>
          )}
        </div>
      </div>

      <div>
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onMouseEnter={() => setHovered(row.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(row.id)}
                onBlur={() => setHovered(null)}
                onClick={() =>
                  setPinned((current) => (current === row.id ? null : row.id))
                }
                aria-pressed={pinned === row.id}
                className={`w-full rounded-lg border px-4 py-3 text-left transition ${focusRing} ${
                  focusId === row.id
                    ? "border-slate-500 bg-[#0f172a]"
                    : "border-transparent hover:bg-[#0f172a]/60"
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.bar}`} />
                    {row.name}
                  </span>

                  <span className="text-slate-400 tabular-nums">
                    {moneyRound.format(row.amount)} ·{" "}
                    {Math.round(row.share * 100)}%
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${row.bar}`}
                    style={{ width: `${row.share * 100}%` }}
                  />
                </div>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm text-slate-400">
          {top.name} is your biggest category at {Math.round(top.share * 100)}%
          of this month's spending. Hover or click a category to focus on it.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: Budget                                                              */
/* -------------------------------------------------------------------------- */

function BudgetPanel({ spentByCategory, limits, onLimitChange }) {
  const totalLimit = Object.values(limits).reduce(
    (sum, value) => sum + value,
    0,
  );
  const totalSpent = Object.values(spentByCategory).reduce(
    (sum, value) => sum + value,
    0,
  );

  return (
    <div>
      <p className="text-sm text-slate-400">
        You've used{" "}
        <span className="font-medium text-white">
          {moneyRound.format(totalSpent)}
        </span>{" "}
        of your {moneyRound.format(totalLimit)} monthly budget. Drag a slider to
        change a limit.
      </p>

      <ul className="mt-6 grid gap-6 md:grid-cols-2">
        {CATEGORIES.map((item) => {
          const spent = spentByCategory[item.id];
          const limit = limits[item.id];
          const ratio = limit > 0 ? spent / limit : 0;
          const over = spent > limit;

          const barColor = over
            ? "bg-red-500"
            : ratio >= 0.85
              ? "bg-amber-500"
              : "bg-blue-500";

          return (
            <li
              key={item.id}
              className="rounded-lg border border-slate-700/60 bg-[#0f172a] p-5"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-white">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.bar}`} />
                  {item.name}
                </span>

                <span className="text-slate-400 tabular-nums">
                  {moneyRound.format(spent)} / {moneyRound.format(limit)}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700/50">
                <div
                  className={`h-full rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${barColor}`}
                  style={{ width: `${Math.min(100, ratio * 100)}%` }}
                />
              </div>

              <p
                className={`mt-2 text-xs ${
                  over
                    ? "text-red-400"
                    : ratio >= 0.85
                      ? "text-amber-400"
                      : "text-slate-500"
                }`}
              >
                {over
                  ? `Over by ${money.format(spent - limit)}`
                  : `${money.format(limit - spent)} left`}
              </p>

              <input
                type="range"
                min="50"
                max="2500"
                step="10"
                value={limit}
                onChange={(event) =>
                  onLimitChange(item.id, Number(event.target.value))
                }
                aria-label={`${item.name} limit`}
                className="mt-4 w-full accent-blue-500"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Live product demo                                                         */
/* -------------------------------------------------------------------------- */

function ProductDemo() {
  const [tab, setTab] = useState("dashboard");
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [limits, setLimits] = useState(INITIAL_LIMITS);
  const [highlightId, setHighlightId] = useState(null);
  const [lastAdded, setLastAdded] = useState(null);
  const [touched, setTouched] = useState(false);

  const nextId = useRef(100);

  const spentByCategory = useMemo(() => {
    const result = {};
    CATEGORIES.forEach((item) => {
      result[item.id] = 0;
    });
    expenses.forEach((expense) => {
      result[expense.category] += expense.amount;
    });
    return result;
  }, [expenses]);

  const totalSpent = Object.values(spentByCategory).reduce(
    (sum, value) => sum + value,
    0,
  );

  const balance = OPENING_BALANCE + INCOME - totalSpent;
  const animatedBalance = useAnimatedNumber(balance);

  useEffect(() => {
    if (highlightId === null) return undefined;
    const id = setTimeout(() => setHighlightId(null), 1600);
    return () => clearTimeout(id);
  }, [highlightId]);

  function goTo(id) {
    setTab(id);
    if (id !== "expenses") setLastAdded(null);
  }

  function handleAdd({ title, category, amount }) {
    const id = nextId.current++;
    const day = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    setExpenses((previous) => [
      ...previous,
      { id, title, category, amount, day },
    ]);
    setHighlightId(id);
    setLastAdded({ title });
    setTouched(true);
  }

  function handleDelete(id) {
    setExpenses((previous) => previous.filter((expense) => expense.id !== id));
    setTouched(true);
  }

  function handleLimitChange(category, value) {
    setLimits((previous) => ({ ...previous, [category]: value }));
    setTouched(true);
  }

  function handleReset() {
    setExpenses(INITIAL_EXPENSES);
    setLimits(INITIAL_LIMITS);
    setLastAdded(null);
    setHighlightId(null);
    setTouched(false);
  }

  function handleTabKeyDown(event) {
    const index = TABS.findIndex((item) => item.id === tab);
    let nextIndex = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + TABS.length) % TABS.length;

    if (nextIndex === null) return;

    event.preventDefault();
    const next = TABS[nextIndex].id;
    goTo(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return (
    <Card className="overflow-hidden">
      {/* Always-visible summary */}
      <div className="flex flex-col gap-4 border-b border-slate-700/60 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-sm text-slate-400">Total balance</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-white tabular-nums">
            {money.format(animatedBalance)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 tabular-nums">
            Spent this month: {moneyRound.format(totalSpent)}
          </span>

          <button
            type="button"
            onClick={handleReset}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-700/40 hover:text-white ${focusRing}`}
          >
            <Icon name="reset" className="h-3.5 w-3.5" />
            Reset demo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Finance Tracker sections"
        onKeyDown={handleTabKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-slate-700/60 px-4 sm:px-6"
      >
        {TABS.map((item) => {
          const selected = tab === item.id;

          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => goTo(item.id)}
              className={`relative whitespace-nowrap px-4 py-4 text-sm font-medium transition ${focusRing} ${
                selected ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}

              {item.id === "expenses" && !touched && (
                <span
                  className="absolute right-1 top-3 flex h-2 w-2"
                  aria-hidden="true"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
              )}

              <span
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-500 transition-opacity ${
                  selected ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="min-h-104 p-6 sm:p-8"
      >
        {tab === "dashboard" && (
          <DashboardPanel
            expenses={expenses}
            totalSpent={totalSpent}
            onGo={goTo}
          />
        )}

        {tab === "expenses" && (
          <ExpensesPanel
            expenses={expenses}
            highlightId={highlightId}
            lastAdded={lastAdded}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onGo={goTo}
          />
        )}

        {tab === "statistics" && (
          <StatisticsPanel
            spentByCategory={spentByCategory}
            totalSpent={totalSpent}
          />
        )}

        {tab === "budget" && (
          <BudgetPanel
            spentByCategory={spentByCategory}
            limits={limits}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Savings calculator                                                        */
/* -------------------------------------------------------------------------- */

function SavingsCalculator({ cta }) {
  const [income, setIncome] = useState(3650);
  const [spending, setSpending] = useState(2600);

  const saved = income - spending;
  const rate = income > 0 ? Math.max(0, Math.round((saved / income) * 100)) : 0;
  const spendingShare =
    income > 0 ? Math.min(100, (spending / income) * 100) : 100;

  const animatedYearly = useAnimatedNumber(saved * 12);
  const fundMonths = saved > 0 ? Math.ceil((spending * 3) / saved) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-8">
        <div className="space-y-8">
          <div>
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="calc-income"
                className="text-sm font-medium text-slate-300"
              >
                Monthly income
              </label>
              <span className="text-lg font-semibold text-white tabular-nums">
                {moneyRound.format(income)}
              </span>
            </div>

            <input
              id="calc-income"
              type="range"
              min="500"
              max="10000"
              step="50"
              value={income}
              onChange={(event) => setIncome(Number(event.target.value))}
              className="mt-4 w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="calc-spending"
                className="text-sm font-medium text-slate-300"
              >
                Monthly spending
              </label>
              <span className="text-lg font-semibold text-white tabular-nums">
                {moneyRound.format(spending)}
              </span>
            </div>

            <input
              id="calc-spending"
              type="range"
              min="200"
              max="10000"
              step="50"
              value={spending}
              onChange={(event) => setSpending(Number(event.target.value))}
              className="mt-4 w-full accent-blue-500"
            />
          </div>

          <p className="text-sm leading-relaxed text-slate-400">
            Not sure what your spending really is? Track it for a month and the
            statistics page will tell you.
          </p>
        </div>
      </Card>

      <Card className="flex flex-col justify-between p-8">
        <div aria-live="polite">
          <p className="text-sm text-slate-400">
            {saved >= 0
              ? "You could keep per year"
              : "You'd overspend per year"}
          </p>

          <p
            className={`mt-1 text-4xl font-semibold tracking-tight tabular-nums ${
              saved >= 0 ? "text-white" : "text-red-400"
            }`}
          >
            {moneyRound.format(Math.abs(animatedYearly))}
          </p>

          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-slate-700/50">
            <div
              className="h-full bg-slate-500 transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${spendingShare}%` }}
            />
            <div
              className="h-full bg-blue-500 transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${100 - spendingShare}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Spent</span>
            <span>Kept: {rate}%</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-slate-400">
            {saved > 0 &&
              `That's ${moneyRound.format(saved)} a month. At this pace a three-month safety cushion takes about ${fundMonths} ${
                fundMonths === 1 ? "month" : "months"
              } to build.`}
            {saved === 0 &&
              "Everything you earn goes out again. Finding one category to trim is a good place to start."}
            {saved < 0 &&
              `You'd spend ${moneyRound.format(-saved)} more than you earn each month. Seeing where it goes is the first step to changing it.`}
          </p>
        </div>

        <div className="mt-8">
          <CtaLink
            cta={cta}
            className={`block ${primaryButton}`}
            label="Start tracking your own numbers"
          />
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

function FaqItem({ item, open, onToggle, index }) {
  return (
    <div className="border-b border-slate-700/60">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-panel-${index}`}
          id={`faq-button-${index}`}
          className={`flex w-full items-center justify-between gap-4 rounded-lg py-5 text-left text-base font-medium text-white transition hover:text-blue-300 ${focusRing}`}
        >
          {item.question}
          <Icon
            name="chevronDown"
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>

      <div
        id={`faq-panel-${index}`}
        role="region"
        aria-labelledby={`faq-button-${index}`}
        className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-5 text-sm leading-relaxed text-slate-400">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating call to action                                                   */
/* -------------------------------------------------------------------------- */

function FloatingCta({ visible, cta, onDismiss }) {
  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl transition-[opacity,transform,visibility] duration-300 motion-reduce:transition-none ${
        visible
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700/60 bg-[#1e293b] px-5 py-4 shadow-2xl">
        <p className="text-sm text-slate-300">
          Ready to track your own spending?
        </p>

        <div className="flex items-center gap-2">
          <Link
            to={cta.to}
            state={cta.state}
            className={`whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 ${focusRing}`}
          >
            {cta.label}
          </Link>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className={`rounded-lg p-2 text-slate-500 transition hover:text-white ${focusRing}`}
          >
            <Icon name="close" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function LandingPage() {
  const cta = useCta();
  const activeSection = useActiveSection(SECTION_IDS);

  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const finalRef = useRef(null);
  const finalInView = useInView(finalRef);

  useEffect(() => {
    let frame = 0;

    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;

      setProgress(max > 0 ? window.scrollY / max : 0);
      setScrolled(window.scrollY > 24);
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const showFloatingCta = progress > 0.12 && !dismissed && !finalInView;

  const navItems = [
    { id: "demo", label: "Live demo" },
    { id: "savings", label: "Calculator" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <div id="top" className="min-h-screen bg-app text-slate-300">
      {/* Header */}
      <header
        className={`sticky top-0 z-40 border-b transition-colors ${
          scrolled
            ? "border-slate-800 bg-[#0f172a]/85 backdrop-blur"
            : "border-transparent bg-[#0f172a]"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a
            href="#top"
            onClick={(event) => scrollToId(event, "top")}
            className={`flex items-center gap-3 rounded-lg ${focusRing}`}
          >
            <LogoMark />
            <span className="text-lg font-semibold text-white">
              Finance Tracker
            </span>
          </a>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(event) => scrollToId(event, item.id)}
                aria-current={activeSection === item.id ? "true" : undefined}
                className={`hidden rounded-lg px-3 py-2 text-sm font-medium transition sm:inline ${focusRing} ${
                  activeSection === item.id
                    ? "bg-slate-700/40 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}

            {!cta.isAuthenticated && (
              <Link
                to="/auth"
                className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white ${focusRing}`}
              >
                Login
              </Link>
            )}

            <Link
              to={cta.to}
              state={cta.state}
              className={`rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 ${focusRing}`}
            >
              {cta.label}
            </Link>
          </nav>
        </div>

        <div
          className="h-0.5 origin-left bg-blue-500"
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden="true"
        />
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 lg:pt-20">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Know exactly where your money goes
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Log expenses, set budgets and watch your statistics update
            instantly. Try it right below, no account needed.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <CtaLink cta={cta} />

            <a
              href="#demo"
              onClick={(event) => scrollToId(event, "demo")}
              className={`flex items-center justify-center gap-2 ${secondaryButton}`}
            >
              Try the live demo
              <Icon name="chevronDown" />
            </a>
          </div>
        </section>

        {/* Live demo */}
        <section
          id="demo"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 pt-6 sm:px-6"
        >
          <ProductDemo />

          <p className="mt-4 text-center text-sm text-slate-500">
            Everything above is connected. Add an expense and the balance,
            statistics and budgets change with it.
          </p>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From sign-up to your first expense in three steps
          </h2>

          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4 md:block">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-[#1e293b] text-sm font-semibold text-white">
                  {index + 1}
                </span>

                <div className="md:mt-5">
                  <h3 className="text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12">
            <CtaLink
              cta={cta}
              label={cta.isAuthenticated ? cta.label : "Start with step one"}
            />
          </div>
        </section>

        {/* Savings calculator */}
        <section
          id="savings"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How much could you keep each month?
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Move the sliders to match your month and see what the difference
              adds up to over a year.
            </p>
          </div>

          <div className="mt-12">
            <SavingsCalculator cta={cta} />
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Questions, answered
          </h2>

          <div className="mt-8 border-t border-slate-700/60">
            {FAQ.map((item, index) => (
              <FaqItem
                key={item.question}
                item={item}
                index={index}
                open={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
              />
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section
          ref={finalRef}
          className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6"
        >
          <Card className="flex flex-col items-start gap-8 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Ready to see where your money goes?
              </h2>

              <p className="mt-3 text-base text-slate-400">
                Create your account and add your first expense today.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <CtaLink cta={cta} />

              {!cta.isAuthenticated && (
                <Link to="/auth" className={secondaryButton}>
                  Login
                </Link>
              )}
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <p className="text-xs text-slate-600">© 2026 Finance Tracker</p>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a
              href="#demo"
              onClick={(event) => scrollToId(event, "demo")}
              className={`rounded transition hover:text-slate-300 ${focusRing}`}
            >
              Live demo
            </a>
            <a
              href="#faq"
              onClick={(event) => scrollToId(event, "faq")}
              className={`rounded transition hover:text-slate-300 ${focusRing}`}
            >
              FAQ
            </a>
            <Link
              to={cta.isAuthenticated ? "/dashboard" : "/auth"}
              className={`rounded transition hover:text-slate-300 ${focusRing}`}
            >
              {cta.isAuthenticated ? "Dashboard" : "Login"}
            </Link>
            <Link
              to="/cookie-policy"
              className={`rounded transition hover:text-slate-300 ${focusRing}`}
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>

      <FloatingCta
        visible={showFloatingCta}
        cta={cta}
        onDismiss={() => setDismissed(true)}
      />
    </div>
  );
}

export default LandingPage;
