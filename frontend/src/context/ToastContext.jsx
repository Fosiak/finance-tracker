import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

let nextId = 0;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, type) => {
      const id = ++nextId;

      setToasts((current) => [...current, { id, message, type }]);

      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const showSuccess = useCallback(
    (message) => show(message, "success"),
    [show],
  );

  const showError = useCallback(
    (message) => show(message, "error"),
    [show],
  );

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6 lg:px-8">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss }) {
  const isError = toast.type === "error";
  const Icon = isError ? XCircle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-card backdrop-blur-xl ${
        isError
          ? "border-red-500/20 bg-[#1a0f0f]/95 text-red-200"
          : "border-emerald-500/20 bg-[#0f1a14]/95 text-emerald-200"
      }`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />

      <p className="flex-1 text-sm leading-5">{toast.message}</p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-current opacity-70 transition hover:opacity-100"
      >
        <X size={15} />
      </button>
    </div>
  );
}

function useToast() {
  return useContext(ToastContext);
}

export { ToastProvider, useToast };
